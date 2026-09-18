import "dotenv/config"
import "temporal-polyfill/full/global"

import express from "express"
import cors from "cors"
import { db } from "./prisma/db.js"

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(cors())
app.use(express.json())

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function textSimilarity(a: string, b: string) {
  const wordsA = new Set(normalizeText(a).split(" ").filter(Boolean))
  const wordsB = new Set(normalizeText(b).split(" ").filter(Boolean))

  if (wordsA.size === 0 || wordsB.size === 0) {
    return 0
  }

  let intersection = 0

  for (const word of wordsA) {
    if (wordsB.has(word)) {
      intersection++
    }
  }

  const union = new Set([...wordsA, ...wordsB]).size

  return union === 0 ? 0 : intersection / union
}

function distanceInKm(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
  const earthRadiusKm = 6371

  const latitudeDifference =
    ((latitude2 - latitude1) * Math.PI) / 180

  const longitudeDifference =
    ((longitude2 - longitude1) * Math.PI) / 180

  const latitude1Radians =
    (latitude1 * Math.PI) / 180

  const latitude2Radians =
    (latitude2 * Math.PI) / 180

  const a =
    Math.sin(latitudeDifference / 2) *
      Math.sin(latitudeDifference / 2) +
    Math.cos(latitude1Radians) *
      Math.cos(latitude2Radians) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2)

  const c =
    2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

function now() {
  return Temporal.Instant.from(new Date().toISOString())
}

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Pulse API is running",
  })
})

/*
|--------------------------------------------------------------------------
| Get All Issues
|--------------------------------------------------------------------------
*/

app.get("/api/issues", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().toLowerCase()
        : ""

    const category =
      typeof req.query.category === "string"
        ? req.query.category
        : ""

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : ""

    let issues = await db.orm.public.Issue.all()

    if (category && category !== "all") {
      issues = issues.filter(
        (issue) => issue.category === category,
      )
    }

    if (status && status !== "all") {
      issues = issues.filter(
        (issue) => issue.status === status,
      )
    }

    if (search) {
      issues = issues.filter((issue) => {
        const title = issue.title.toLowerCase()
        const description = issue.description.toLowerCase()
        const location = issue.location.toLowerCase()

        return (
          title.includes(search) ||
          description.includes(search) ||
          location.includes(search)
        )
      })
    }

    res.json({
      success: true,
      issues,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
    })
  }
})

/*
|--------------------------------------------------------------------------
| Get Single Issue
|--------------------------------------------------------------------------
*/

app.get("/api/issues/:id", async (req, res) => {
  try {
    const issue = await db.orm.public.Issue
      .where({
        id: req.params.id,
      })
      .first()

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      })
    }

    const statusHistory =
      await db.orm.public.StatusHistory.where({
        issueId: req.params.id,
      })

    const confirmations =
      await db.orm.public.Confirmation.where({
        issueId: req.params.id,
      })

    const comments =
      await db.orm.public.Comment.where({
        issueId: req.params.id,
      })

    res.json({
      success: true,
      issue: {
        ...issue,
        statusHistory,
        confirmations,
        comments,
      },
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch issue",
    })
  }
})

/*
|--------------------------------------------------------------------------
| Create Issue
|--------------------------------------------------------------------------
*/

app.post("/api/issues", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      latitude,
      longitude,
      imageUrl,
    } = req.body

    if (
      !title ||
      !description ||
      !category ||
      !location ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      })
    }

    const latitudeNumber = Number(latitude)
    const longitudeNumber = Number(longitude)

    if (
      Number.isNaN(latitudeNumber) ||
      Number.isNaN(longitudeNumber)
    ) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude must be valid numbers",
      })
    }

    const existingIssues =
      await db.orm.public.Issue.all()

    const newText = `${title} ${description}`

    const duplicate = existingIssues.find((issue) => {
      const distance = distanceInKm(
        latitudeNumber,
        longitudeNumber,
        issue.latitude,
        issue.longitude,
      )

      const sameCategory =
        issue.category === category

      const similarity = textSimilarity(
        newText,
        `${issue.title} ${issue.description}`,
      )

      return (
        distance <= 0.5 &&
        sameCategory &&
        similarity >= 0.5
      )
    })

    if (duplicate) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        message:
          "A similar issue has already been reported nearby.",
        issueId: duplicate.id,
      })
    }

    const timestamp = now()

    const issue =
      await db.orm.public.Issue.create({
        title,
        description,
        category,
        status: "reported",
        location,
        latitude: latitudeNumber,
        longitude: longitudeNumber,
        imageUrl: imageUrl || null,
        createdAt: timestamp,
        updatedAt: timestamp,
      })

    await db.orm.public.StatusHistory.create({
      issueId: issue.id,
      status: "reported",
      note: "Issue reported by community",
      createdAt: timestamp,
    })

    res.status(201).json({
      success: true,
      message: "Issue reported successfully",
      issue,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Failed to create issue",
    })
  }
})

/*
|--------------------------------------------------------------------------
| Confirm Issue
|--------------------------------------------------------------------------
*/

app.post("/api/issues/:id/confirm", async (req, res) => {
  try {
    const { visitorId } = req.body

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        message: "Visitor ID is required",
      })
    }

    const issue =
      await db.orm.public.Issue
        .where({
          id: req.params.id,
        })
        .first()

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      })
    }

    const existingConfirmation =
      await db.orm.public.Confirmation
        .where({
          issueId: req.params.id,
          visitorId,
        })
        .first()

    if (existingConfirmation) {
      return res.status(409).json({
        success: false,
        message:
          "You have already confirmed this issue.",
      })
    }

    const confirmation =
      await db.orm.public.Confirmation.create({
        issueId: issue.id,
        visitorId,
        createdAt: now(),
      })

    res.status(201).json({
      success: true,
      message: "Issue confirmed successfully",
      confirmation,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Failed to confirm issue",
    })
  }
})

/*
|--------------------------------------------------------------------------
| Add Comment
|--------------------------------------------------------------------------
*/

app.post("/api/issues/:id/comments", async (req, res) => {
  try {
    const { author, content } = req.body

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      })
    }

    const issue =
      await db.orm.public.Issue
        .where({
          id: req.params.id,
        })
        .first()

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      })
    }

    const comment =
      await db.orm.public.Comment.create({
        issueId: req.params.id,
        author: author || null,
        content,
        createdAt: now(),
      })

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    })
  }
})

/*
|--------------------------------------------------------------------------
| Update Issue Status
|--------------------------------------------------------------------------
*/

app.patch("/api/issues/:id/status", async (req, res) => {
  try {
    const { status, note } = req.body

    const allowedStatuses = [
      "reported",
      "verified",
      "in_progress",
      "resolved",
    ]

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue status",
      })
    }

    const issue =
      await db.orm.public.Issue
        .where({
          id: req.params.id,
        })
        .first()

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      })
    }

    const timestamp = now()

    /*
     * Prisma 8:
     * filter with .where()
     * then update with .update()
     */
    const updatedIssue =
      await db.orm.public.Issue
        .where({
          id: req.params.id,
        })
        .update({
          status,
          updatedAt: timestamp,
        })

    if (!updatedIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue could not be updated",
      })
    }

    const history =
      await db.orm.public.StatusHistory.create({
        issueId: req.params.id,
        status,
        note: note || null,
        createdAt: timestamp,
      })

    res.json({
      success: true,
      message: "Issue status updated successfully",
      issue: updatedIssue,
      history,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Failed to update issue status",
    })
  }
})

/*
|--------------------------------------------------------------------------
| Analytics
|--------------------------------------------------------------------------
*/

app.get("/api/analytics", async (_req, res) => {
  try {
    const issues = await db.orm.public.Issue.all()

    const analytics = {
      total: issues.length,

      reported: issues.filter(
        (issue) => issue.status === "reported",
      ).length,

      verified: issues.filter(
        (issue) => issue.status === "verified",
      ).length,

      inProgress: issues.filter(
        (issue) => issue.status === "in_progress",
      ).length,

      resolved: issues.filter(
        (issue) => issue.status === "resolved",
      ).length,

      categories: {
        pothole: issues.filter(
          (issue) => issue.category === "pothole",
        ).length,

        garbage: issues.filter(
          (issue) => issue.category === "garbage",
        ).length,

        streetlight: issues.filter(
          (issue) => issue.category === "streetlight",
        ).length,

        water: issues.filter(
          (issue) => issue.category === "water",
        ).length,

        drainage: issues.filter(
          (issue) => issue.category === "drainage",
        ).length,

        other: issues.filter(
          (issue) => issue.category === "other",
        ).length,
      },
    }

    res.json({
      success: true,
      analytics,
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    })
  }
})

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

app.listen(PORT, () => {
  console.log(
    `Pulse API running at http://localhost:${PORT}`,
  )
})