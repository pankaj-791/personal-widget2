package expo.modules.installedapps

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream

class InstalledAppsModule : Module() {
  private val context
    get() = appContext.reactContext
      ?: throw Exception("React context is not available")

  override fun definition() = ModuleDefinition {
    Name("InstalledApps")

    AsyncFunction("getInstalledApps") {
      val pm = context.packageManager
      val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      val resolved = pm.queryIntentActivities(intent, 0)
      val seen = HashSet<String>()
      val result = ArrayList<Map<String, String>>()
      for (info in resolved) {
        val pkg = info.activityInfo.packageName
        if (pkg == context.packageName || !seen.add(pkg)) continue
        val label = info.loadLabel(pm).toString()
        val icon = drawableToBase64(info.loadIcon(pm))
        result.add(
          mapOf("packageName" to pkg, "label" to label, "icon" to icon)
        )
      }
      result.sortBy { it["label"]?.lowercase() }
      result
    }

    AsyncFunction("launchApp") { packageName: String ->
      val launch = context.packageManager.getLaunchIntentForPackage(packageName)
      if (launch == null) {
        false
      } else {
        launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(launch)
        true
      }
    }

    AsyncFunction("isAppInstalled") { packageName: String ->
      context.packageManager.getLaunchIntentForPackage(packageName) != null
    }
  }

  private fun drawableToBase64(drawable: Drawable): String {
    val size = 96
    val bitmap = if (drawable is BitmapDrawable && drawable.bitmap != null) {
      Bitmap.createScaledBitmap(drawable.bitmap, size, size, true)
    } else {
      val bmp = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bmp)
      drawable.setBounds(0, 0, size, size)
      drawable.draw(canvas)
      bmp
    }
    val stream = ByteArrayOutputStream()
    bitmap.compress(Bitmap.CompressFormat.PNG, 100, stream)
    return Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
  }
}
