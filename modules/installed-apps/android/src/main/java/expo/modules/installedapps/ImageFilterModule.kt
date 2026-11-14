package expo.modules.installedapps

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.ColorMatrix
import android.graphics.ColorMatrixColorFilter
import android.graphics.Matrix
import android.graphics.Paint
import android.media.ExifInterface
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream

class ImageFilterModule : Module() {
  private val context
    get() = appContext.reactContext
      ?: throw Exception("React context is not available")

  override fun definition() = ModuleDefinition {
    Name("ImageFilter")

    AsyncFunction("applyFilter") { uri: String, matrix: List<Double>, maxSize: Int ->
      if (matrix.size != 20) throw Exception("Matrix must have 20 values")
      val path = uri.removePrefix("file://")
      if (!File(path).exists()) throw Exception("Image file not found")

      val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
      BitmapFactory.decodeFile(path, bounds)
      var sample = 1
      while (bounds.outWidth / (sample * 2) >= maxSize ||
        bounds.outHeight / (sample * 2) >= maxSize
      ) {
        sample *= 2
      }

      val options = BitmapFactory.Options().apply { inSampleSize = sample }
      val decoded = BitmapFactory.decodeFile(path, options)
        ?: throw Exception("Could not read image")

      val rotation = readRotation(path)
      val upright = if (rotation != 0) {
        val m = Matrix()
        m.postRotate(rotation.toFloat())
        Bitmap.createBitmap(decoded, 0, 0, decoded.width, decoded.height, m, true)
      } else {
        decoded
      }

      // Our matrix uses offsets from 0 to 1. Android expects 0 to 255.
      val values = FloatArray(20) { i ->
        val v = matrix[i].toFloat()
        if (i % 5 == 4) v * 255f else v
      }
      val paint = Paint().apply {
        colorFilter = ColorMatrixColorFilter(ColorMatrix(values))
        isFilterBitmap = true
      }
      val output = Bitmap.createBitmap(
        upright.width,
        upright.height,
        Bitmap.Config.ARGB_8888
      )
      Canvas(output).drawBitmap(upright, 0f, 0f, paint)

      val dir = File(context.cacheDir, "filtered")
      dir.mkdirs()
      val target = File(dir, "f-${System.currentTimeMillis()}.jpg")
      FileOutputStream(target).use {
        output.compress(Bitmap.CompressFormat.JPEG, 90, it)
      }
      dir.listFiles()
        ?.sortedByDescending { it.lastModified() }
        ?.drop(3)
        ?.forEach { it.delete() }

      "file://" + target.absolutePath
    }
  }

  private fun readRotation(path: String): Int {
    return try {
      when (
        ExifInterface(path).getAttributeInt(
          ExifInterface.TAG_ORIENTATION,
          ExifInterface.ORIENTATION_NORMAL
        )
      ) {
        ExifInterface.ORIENTATION_ROTATE_90 -> 90
        ExifInterface.ORIENTATION_ROTATE_180 -> 180
        ExifInterface.ORIENTATION_ROTATE_270 -> 270
        else -> 0
      }
    } catch (e: Exception) {
      0
    }
  }
}
