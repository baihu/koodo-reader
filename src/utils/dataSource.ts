import { isElectron } from "react-device-detect";
import {
  driveList,
  type DriveItem,
  type DrivePlatform,
} from "../constants/driveList";

type DriveLabelLike = Pick<DriveItem, "label" | "isPro">;

const manualConfigDrives = new Set([
  "webdav",
  "docker",
  "ftp",
  "sftp",
  "mega",
  "s3compatible",
]);

const oauthDrives = new Set([
  "dropbox",
  "dubox",
  "yandex",
  "yiyiwu",
  "google",
  "boxnet",
  "pcloud",
  "adrive",
  "microsoft_exp",
  "microsoft",
]);

const helpDocumentDrives = new Set(["webdav", "ftp", "sftp", "s3compatible"]);

const selfHostedSyncDrives = new Set([
  "webdav",
  "ftp",
  "sftp",
  "smb",
  "s3compatible",
  "icloud",
  "docker",
]);

const browserCloudBootstrapBlockedDrives = new Set(["webdav", "s3compatible"]);

const browserCompatibilityTips: Record<string, string> = {
  webdav:
    "Only WebDAV service provided by Alist is directly supported in Browser, Other WebDAV services need to enable CORS to work properly. Also due to browser's security restrictions, the WebDAV service must be accessed via HTTPS protocol when you're visiting Koodo Reader via HTTPS protocol.",
  docker:
    "The Koodo Reader Docker version does not support the data source feature by default. You need to modify the configuration parameters during deployment to manually enable it. Also due to browser's security restrictions, the Docker service must be accessed via HTTPS protocol when you're visiting Koodo Reader via HTTPS protocol.",
  s3compatible:
    "Some S3 services are not compatible with browser environments. If you encounter connection issues, please refer to the service provider's official documentation for instructions on enabling CORS. Also due to browser's security restrictions, the S3 service must be accessed via HTTPS protocol when you're visiting Koodo Reader via HTTPS protocol.",
};

export const getCurrentDrivePlatform = (): DrivePlatform =>
  isElectron ? "desktop" : "browser";

export const getDrive = (driveName?: string | null): DriveItem | undefined =>
  driveList.find((item) => item.value === driveName);

export const getDriveLabel = (driveName?: string | null): string =>
  getDrive(driveName)?.label || "";

export const formatDriveOptionLabel = (drive: DriveLabelLike): string =>
  drive.label + (drive.isPro ? " (Pro)" : "");

export const isDrivePro = (driveName?: string | null): boolean =>
  Boolean(getDrive(driveName)?.isPro);

export const isDriveSupportedOnPlatform = (
  driveName?: string | null,
  platform: DrivePlatform = getCurrentDrivePlatform()
): boolean => Boolean(getDrive(driveName)?.support.includes(platform));

export const isDriveSupportedInCurrentPlatform = (
  driveName?: string | null
): boolean => isDriveSupportedOnPlatform(driveName, getCurrentDrivePlatform());

export const isDriveVisibleInCurrentEnvironment = (
  driveName?: string | null
): boolean => {
  if (!isDriveSupportedInCurrentPlatform(driveName)) {
    return false;
  }
  if (isElectron && process.platform !== "darwin" && driveName === "icloud") {
    return false;
  }
  return true;
};

export const getVisibleDriveList = (): DriveItem[] =>
  driveList.filter((item) => isDriveVisibleInCurrentEnvironment(item.value));

export const isManualConfigDrive = (driveName?: string | null): boolean =>
  manualConfigDrives.has(driveName ?? "");

export const isOAuthDrive = (driveName?: string | null): boolean =>
  oauthDrives.has(driveName ?? "");

export const shouldCheckCorsBeforeBinding = (
  driveName?: string | null
): boolean => driveName === "webdav";

export const getBrowserCompatibilityTip = (
  driveName?: string | null
): string => {
  if (isElectron) {
    return "";
  }
  return browserCompatibilityTips[driveName ?? ""] || "";
};

export const shouldShowDriveHelpLink = (
  driveName?: string | null,
  lang?: string | null
): boolean =>
  Boolean(
    lang &&
      lang.startsWith("zh") &&
      helpDocumentDrives.has(driveName ?? "")
  );

export const shouldPromptEnableKoodoSync = (
  driveName?: string | null
): boolean => Boolean(driveName && !selfHostedSyncDrives.has(driveName));

export const canBootstrapDriveFromCloudSync = (
  driveName?: string | null
): boolean => {
  if (!driveName || driveName === "icloud") {
    return false;
  }
  if (!isDriveVisibleInCurrentEnvironment(driveName)) {
    return false;
  }
  if (!isElectron && browserCloudBootstrapBlockedDrives.has(driveName)) {
    return false;
  }
  return true;
};
