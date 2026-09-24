const { withAppBuildGradle } = require('expo/config-plugins');

const MARKER = 'STRIDE_RELEASE_SIGNING';

const SIGNING_BLOCK = `
    // ${MARKER}
    def strideReleaseKeystoreProperties = new Properties()
    def strideReleaseKeystoreFile = new File(projectRoot, "credentials/keystore.properties")
    if (strideReleaseKeystoreFile.exists()) {
        strideReleaseKeystoreProperties.load(new FileInputStream(strideReleaseKeystoreFile))
    }
`;

const RELEASE_CONFIG = `
        release {
            if (strideReleaseKeystoreFile.exists()) {
                storeFile new File(new File(projectRoot, "credentials"), strideReleaseKeystoreProperties['storeFile'])
                storePassword strideReleaseKeystoreProperties['storePassword']
                keyAlias strideReleaseKeystoreProperties['keyAlias']
                keyPassword strideReleaseKeystoreProperties['keyPassword']
            }
        }
`;

/**
 * Firma release con credentials/keystore.properties (generado por scripts/ensure-release-keystore.sh).
 */
function withAndroidReleaseSigning(config) {
  return withAppBuildGradle(config, (gradleConfig) => {
    let contents = gradleConfig.modResults.contents;
    if (contents.includes(MARKER)) {
      return gradleConfig;
    }

    const projectRootAnchor = 'def projectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()';
    if (!contents.includes(projectRootAnchor)) {
      throw new Error(
        `[${MARKER}] No se encontró projectRoot en android/app/build.gradle; revisa el template de Expo.`,
      );
    }

    contents = contents.replace(projectRootAnchor, `${projectRootAnchor}\n${SIGNING_BLOCK}`);

    contents = contents.replace(
      /signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\}\s*\}/,
      (block) => {
        if (block.includes('release {')) {
          return block;
        }
        const trimmed = block.replace(/\}\s*$/, '');
        return `${trimmed}\n${RELEASE_CONFIG}\n    }`;
      },
    );

    contents = contents.replace(
      /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/,
      '$1signingConfig signingConfigs.release',
    );

    gradleConfig.modResults.contents = contents;
    return gradleConfig;
  });
}

module.exports = withAndroidReleaseSigning;
