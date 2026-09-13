plugins {
    id("com.android.application")
    kotlin("android")
}

android {
    namespace = "co.truepower.thermal"
    compileSdk = 35

    defaultConfig {
        applicationId = "co.truepower.thermal"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        buildConfigField("String", "WEB_APP_URL", "\"https://www.truepower.co.ke/admin\"")
    }

    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.10.0")
    implementation("androidx.webkit:webkit:1.12.1")
}
