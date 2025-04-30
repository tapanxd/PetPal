/**
 * Upload a document or image to S3
 */
export const uploadDocumentToS3 = async (uri: string, fileName: string): Promise<string | null> => {
  try {
    const response = await fetch(uri)
    const blob = await response.blob()
    const s3FileName = `${fileName}`

    // Generate S3 URL
    const S3_BUCKET_NAME = process.env.EXPO_PUBLIC_S3_BUCKET_NAME
    const S3_REGION = process.env.EXPO_PUBLIC_S3_REGION
    const uploadURL = `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${s3FileName}`

    // Determine content type based on file extension
    const fileExtension = fileName.split(".").pop()?.toLowerCase()
    let contentType = "application/octet-stream"

    if (fileExtension === "jpg" || fileExtension === "jpeg") {
      contentType = "image/jpeg"
    } else if (fileExtension === "png") {
      contentType = "image/png"
    } else if (fileExtension === "pdf") {
      contentType = "application/pdf"
    }

    // Upload to S3
    const uploadRes = await fetch(uploadURL, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": contentType,
      },
    })

    if (!uploadRes.ok) throw new Error("Failed to upload file")

    console.log("✅ File uploaded successfully:", uploadURL)
    return uploadURL
  } catch (error: unknown) {
    console.error("❌ File upload failed:", error instanceof Error ? error.message : error)
    return null
  }
}

