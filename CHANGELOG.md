# Changelog

All notable changes to Kriterion, kept short for the people who run it.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/).

> A box above the changes of a version means there is something to do when updating.
> Yanked versions are marked `[YANKED]`.

## [0.56.6] - 2026-10-03

Fingerprint `55fa87e4` — previously `859baa64`.

### Changed

- Someone who is neither the author of an entry nor an admin sees it without the buttons for what they may not change: title, description, status and category are plain text; the drop field for photos and videos, the crop, deleting and dragging are missing. At someone else's test day, score, × and tags are read-only.
- The import checks the free space for the unpacked content before reading the file and refuses with the figures.
- "Info" reads PDF details stored in a compressed object stream and Office and OpenDocument files stored as ZIP64.

### Fixed

- A transaction that first read and then wrote failed at once with "database is locked" while another connection was writing (image worker, `usertool.js`); it now waits up to 5 seconds. Moving files from the database to disk after the start could stop for an hour this way; a failed file is now retried after a minute.
- An import file with a too old format stayed open until the restart and kept its disk space.
- After a refused change, title, description, category, crop and order show the saved state again.

## [0.56.5] - 2026-10-03

Fingerprint `859baa64` — previously `5d8a9336`.

### Changed

- The overview filter "◆ ★" is a bar with three fields: "None", "Partial" and 👍. 👍 shows the entries with your own stars for at least the threshold of the criteria. A second click switches the filter off.

## [0.56.4] - 2026-10-03

Fingerprint `5d8a9336` — previously `6a318ea6`.

### Changed

- Full screen: a click or double tap on the picture shows the original at 100 %, and the clicked spot stays in place. The button is now called "100 %" and shows the middle.
- Full screen on the phone in portrait: the title has its own line next to ✕, the buttons are below. For files, the file name comes first, the entry title small next to it.
- Full screen on touch devices: the arrows ‹ › are hidden while a video plays; the zoomed picture has no scroll bars.
- "Load whole" shows the progress in the button ("Cancel 45 %") instead of next to it.
- Input fields have a stronger border, 3 : 1 against the card. Light theme: the focus ring and the arrows, ▶ and ★ on photos have more contrast.
- Buttons that appear on hover also appear with keyboard focus; the file and folder menu shows the focus with a ring.
- Sign-in rate limit: for IPv6, the whole /64 network counts as one address.

### Fixed

- Full screen: the arrows and the picture ignored the notch and the gesture bar of the phone; zooming showed a white corner between the scroll bars; tiles without a thumbnail in the strip were dimmed and hard to read.
- Entry preview: a swipe still browsed when a second finger joined or the page was zoomed.
- Touch devices: the arrows on the image and in full screen changed their transparency after a tap.

## [0.56.3] - 2026-10-03

Fingerprint `6a318ea6` — previously `df009920`.

### Changed

- The overview filter for your own stars is now called "◆ ★", only "★" without the potential mode; its tooltip names the words from the vocabulary.
- The threshold for "Partial" can be set in "Potential: criteria" and in "Rating: criteria"; both show the same value.
- Info on images and videos: only "General" is open; the other groups open with a click on their heading.
- German: "Farbunterabtastung" is now "Chroma Subsampling".
- Behind a reverse proxy, `X-Forwarded-For` is read only from the own network: loopback, private networks, 100.64.0.0/10, IPv6 ULA and link-local.

### Fixed

- Emails showed "{instanceTitle}" instead of the title of the installation, in subject and text.
- Sign-in rate limit: parallel attempts from one address all got through before the lock; the confirmation link of a sign-up request reset the counter.
- Password and two-factor code were not rate-limited for signed-in users (own account, two-factor settings).
- "Restore default layout" broke the entry view until reload.
- The role "Owner admin" could not be assigned in the interface.
- "Old backups": each digit typed rebuilt the field, the value was not saved, and "Delete now" could delete more than shown.
- A test day after midnight failed with "date in the future" until 2 a.m. in Germany and 3 a.m. in Turkey.
- A photo without a thumbnail returned an error instead of the original.
- Fetching missing files back from a full or read-only backup drive ended the server.
- An update during a backup blocked backups for 24 hours.
- Seeking in a video could leave the file open on the server.
- If renaming a file fetched back from a backup failed, the copy was deleted.
- `backuptool restore` named a backup number that had shifted after an abort; it now names the time.
- `keytool.sh`: a failed copy of the data directory went unnoticed, the new key showed in the process list, and the expected log line was wrong.
- `.env.before-key-change-*` from `keytool.sh` ended up in the Docker image.
- A blank password in the mail settings reused the stored one for a different server.
- The reason of a failed email was missing when approving a sign-up request.
- A locked owner admin could not be demoted or removed while another owner admin was active.
- Interface: a late answer overwrote the view opened after it; "Next ›" ignored filters and sort order; adding an image while editing a comment lost the text; a double click created an entry or comment twice; selecting text in a dialog and releasing outside closed it; an expired session with full screen open blocked the sign-in.
- Interface: the export size left out comment videos; "Links" opened collapsed showed one row; the open-task counter counted done tasks; an arrow key in full screen with one item stopped the video; the compare bar stayed outside the overview; sorting by potential stayed active without the potential mode; a short image conversion left its button disabled; network errors on an entry read "not found".
- Phone: user rows in "Users" were wider than the screen; "From the start" on a video lay under the video tools; the upload indicator covered the menu button; the settings tabs stayed hidden after rotating.
- Texts: hard-coded German words and example addresses, the section named for search engines, and the field named in the cleanup rule error.

## [0.56.2] - 2026-10-03

Fingerprint `df009920` — previously `a8fe80d0`.

### Changed

- "Extended info" on images and videos is now called "Info", as on documents: in the ⋯ menu, at ⓘ in full screen and in the dialog.

## [0.56.1] - 2026-10-03

Fingerprint `a8fe80d0` — previously `a161550c`.

### Changed

- The overview filters own values in one group "Own values: None · Partial" at the end of the status row instead of the row "Potential" and "Rating". Untested entries count by potential, tested ones by rating; a second click switches it off. Saved filters and views drop their old values for potential and rating.
- Full screen: "Close" stays at the top right, the bin is the first button of the bar.
- Full screen: on touch, a tap beside the picture no longer closes it; a mouse click still does.
- Full screen covers the page completely in the dark scheme.

### Fixed

- Full screen on a phone in landscape: no strip and a lower header; on 640 × 360, a 16:9 video gets 544 × 306 instead of 263 × 148 px.
- Full screen: the buttons at the top wrapped although one row had room.
- Full screen: Back in the browser or on the phone closes it; before, the page behind changed and full screen stayed open.
- Full screen: a swipe no longer browses when it starts on a video, uses two fingers or the page is zoomed.
- Full screen takes the focus and gives it back when closed; Tab and screen readers no longer reach the page behind.

## [0.56.0] - 2026-10-02

Fingerprint `a161550c` — previously `cc298c6f`.

### Added

- The owner admin sets the proxy bit rate in the card "Proxy": 1 to 8 Mbit/s for 1080p30, default 5.
- In the list view under "Files", a computer shows "Proxy" before Edit and Link for a video with a proxy.

### Changed

- The proxy bit rate follows pixels and frame rate, at most 10 Mbit/s; before, 0.23 Mbit per frame up to 7.5 Mbit/s.
- After the update and after each change of the bit rate, proxies are replaced in the background, played videos first.
- The old proxy plays until the new one is ready; a replacement that fails keeps it until the next start.

### Fixed

- On a phone, an entry with files was 719 instead of 412 px wide: the buttons in the header of "Files" did not wrap.
- Full screen on a phone showed only part of a video: Chrome laid it out as wide as the page. It now fits the screen.
- The strip in full screen scrolls only itself, no longer the page behind it.
- Full screen on a phone: the buttons at the top wrap; with "Load whole" and "Proxy" shown, "Close" was off-screen.

## [0.55.1] - 2026-10-02

Fingerprint `cc298c6f` — previously `064133fa`.

### Added

- "Extended info" shows in the group "Proxy" the bit rates of video and audio, measured on the proxy.

### Changed

- In full screen, the proxy button names what plays, "Proxy" or "Original", and has no highlight.

## [0.55.0] - 2026-10-02

Fingerprint `064133fa` — previously `6402677f`.

> For proxies of videos, add `tmpfs: - /tmp:size=2g` to `docker-compose.yml`, and `devices: - /dev/dri:/dev/dri` for Quick Sync (README, "Proxies for videos").

### Added

- Proxies for videos under "Files": a smaller version in H.264 with AAC, at most 1080 pixels on the shorter side, the frame rate of the original and 0.23 Mbit per frame up to 7.5 Mbit/s. It plays on computers and phones as soon as it is ready; "Original" in full screen switches for one playback, "Download" delivers the original. The owner admin switches proxies on in the new card "Proxy" (default off).
- Quick Sync encodes the proxies when `/dev/dri` is mounted; otherwise the CPU converts at the lowest priority. The image builds ffmpeg 9.0.2 for this. `mkv`, `avi`, `wmv` and `flv` play through their proxy and get a thumbnail from it.
- "Extended info" shows the group "Proxy" with state, resolution and size.
- "Reconcile" in "Storage and maintenance" (owner admin): lists every file, directory and symbolic link in `data/files/` without a reference, with any name, and deletes the chosen ones if the backup folder holds them, no backup names them or Kriterion does not create such a name; lists missing files with entry and folder and fetches them back from the backup folder; checks the database and reports only.
- A missing file shows "missing" under "Files".
- "Storage and maintenance" shows the free space inside the database.

### Changed

- "Load whole" in the full-screen view of a video works only on its button: the video pauses, loads once and continues from the copy. Without the button the browser buffers as before 0.52.0.
- Settings are reorganised: a section "Backup" with "Backup", "Old backups" and "Export and import"; "Metrics" is split into "Metrics", "Storage and maintenance" and "Version and encryption"; "Second factor" is a card of its own; the link rows are in "Appearance"; "Vocabulary" is a wide card.
- A user sees only "Personal" under Settings. Admins see locked fields as text; only the owner admin sees the hint about the key next to the database.
- Where the owner admin sees a server command, everyone else reads "ask an admin who can help you with it".
- Deleting files without a reference moved from a button in the card into "Reconcile".
- `docker-compose.example.yml` puts `/tmp` into RAM (`tmpfs`, 2 GB); proxies are only created there. `/dev/dri` is listed, commented out.

## [0.54.0] - 2026-10-01

Fingerprint `6402677f` — previously `5e5fb3c7`.

### Added

- "Rename …" in the "…" menu of an own file; the extension stays, and a name already used in the same folder is refused.
- "Info" for Word, Excel, PowerPoint, OpenDocument and PDF files: upload, last save in the Document Server and its account, and title, author, pages and dates from the file.
- "Extended info" of an image shows EXIF under "Capture": time taken, camera, lens, exposure, aperture, ISO, focal length; a location only as "yes". New dependency `exif-reader`.
- Overview filters "Potential" and "Rating" with "None" and "Partial", measured by your own stars; an admin sets the threshold for "Partial" (default 80 %) in "Rating: criteria".

### Changed

- "Type" shows format and pixels of an image as displayed ("PNG · 1920 × 1080"); the thumbnail shows the format.
- Thumbnails embedded in an image file appear as one row under "Image" instead of further "Image" groups.
- After the update, Kriterion reads each image and photo once more in the background for orientation and EXIF.
- Collapsed, the "Files" header shows only counts and size.
- "Rejected on … by …" and the title of the task button come from the language files; in English the card and section are "Users".
- The manual no longer describes "Export entry", which does not exist.

## [0.53.0] - 2026-10-01

Fingerprint `5e5fb3c7` — previously `a4d2ab5e`.

### Added

- "Delete file" moves the file to the "Trash" for 30 days; the owner admin restores it with folder, author and date.
- "Deleted files …" in an entry (owner admin) lists files from the trash and from Backups; "Fetch back" restores them.
- A file saved again since the Backup comes back next to the current one as "Name (Backup DD.MM.YYYY).ext".
- "Files" also sorts by "Type"; folders then sort by name.
- "Extended info" for the photos and videos of an entry; ⓘ in the full-screen view opens it.
- Security log: "File fetched from backup" for each file taken from a Backup.

### Changed

- "Extended info" shows the "Container" of a video and the codec as "H.264 (AVC)"; thumbnails and the list show "H.264".
- With a dialog open over the full-screen view, arrow keys no longer page and Esc closes only the dialog.
- After the update, Kriterion reads each photo and video of the entries once in the background.
- README and manual in English (`README.md`, `manual.md`), German (`README-de.md`, `manual-de.md`) and Turkish.
- The CHANGELOG is in English and shorter.

## [0.52.0] - 2026-09-30

Fingerprint `a4d2ab5e` — previously `7ace25ed`.

### Added

- "Files" sorts by "Name", "Date" or "Size" with a direction button; on desktop the list header sorts too.
- "Grouped by type": a divider row with a count per file type, also inside each folder.
- "Extended info" in the "…" menu of images and videos: codec, resolution, bit rates, frame rate, audio tracks.
- A video's codec shows on its thumbnail and in the list; new dependency `mediainfo.js`.
- Full-screen playback loads the whole video (up to 2 GB on desktop, 500 MB on phones) and shows "loaded … %".

### Changed

- After the update, Kriterion reads each image and video under "Files" once in the background; files stay unchanged.
- "Type" names the kind of file (Video, Image, PDF, Word …) instead of the extension.
- "…" menu: five groups, "Open" for images and videos; "Choose thumbnail …" replaces "Use this frame as thumbnail".
- List rows stack type, size and date, also next to "Edit"; ✎ and 🔗 sit in a fixed column.

## [0.51.0] - 2026-09-30

Fingerprint `7ace25ed` — previously `2b87077f`.

> After updating from the ZIP, make the new script executable: `chmod +x kriterion/backuptool.sh`.

### Added

- `./backuptool.sh list`, `show`, `check`, `restore`: inspect Backups (version, files, key, schema) and restore one.
- `restore` first backs up the current state; afterwards `data/files/` holds exactly the files of the chosen Backup.
- "Old backups" shows version, files and "only here" per Backup; "Select" deletes several, keeping "Keep at least".
- "check" names the version and whether the schema fits the installed version.
- "Files" sorts by "Oldest first", "Newest first" or "Name", per account; list view shows "Edit" in the row.

### Changed

- "Files" now shows the oldest folder first by default; "Newest first" gives the previous order.
- Every Backup writes its file list, whose first line names the version; the "Backup" card points to `./backuptool.sh`.
- "from 3:12" and "From the start" stay 10 s instead of 5 s when a video resumes.

## [0.50.0] - 2026-09-30

Fingerprint `2b87077f` — previously `210a7f57`.

> First start moves all files from the database to `data/files/`; without room for them plus 1 GB, it does not start.
> "Video on test day" is now the limit "File" (default 2048 MB) for all files; set it again under "Upload limits".
> `POST /api/items/:id/attachments` is gone, scripts upload in chunks; NPMplus: drop `attachments` from the location.

### Added

- "Select" under "Files" and in the photo strip deletes several tiles at once; under "Files" it also moves them.
- Videos resume per account where you stopped; "From the start" shows for a few seconds.
- Folders stay open or closed per account, on every device.
- "Metrics" counts the files still waiting to be moved to disk.

### Changed

- Every file under "Files" is stored encrypted on disk and uploaded in chunks, up to the "File" limit.
- The Backup copies every file to `kriterion-files/`; the backup folder needs room for all of them.
- Above the "Attachment" limit, Office and text files are download-only; PDF, images and videos still open.
- Camera-branded videos such as Sony XAVC HS count as MP4.
- Image thumbnails are created on first view, text thumbnails shortly after upload.

### Removed

- `POST /api/items/:id/attachments` and the limit of 20 files per selection.

### Fixed

- On a test day, "more" shows only when tags are hidden.

## [0.49.0] - 2026-09-29

Fingerprint `210a7f57` — previously `e480ecfc`.

> NPMplus: use `uploads/[0-9a-f]+` in the upload location, not `uploads/[0-9a-f]{32}`; the braces take the host offline.
> A Document Server now fetches every Office file and PDF once for thumbnails; they stay unencrypted in its cache.

### Added

- "Tiles" and "List" in the header of the "Files" block, per account; tiles by default.
- "List" shows one row per file with name, type, size, upload date and author; two lines on phones.
- Document thumbnails: first lines of text, Markdown, CSV and log files; first page of Office files and PDF.

### Changed

- After the update, thumbnails for existing documents are created in the background, one at a time.
- Each group in "Files" has a frame; a collapsed folder is a bar.
- The Docker image includes the font `fonts-dejavu-core`.

## [0.48.0] - 2026-09-29

Fingerprint `e480ecfc` — previously `a49b4154`.

> Files in folders with a test day live in `data/files/`: copy it with `data/`; the backup folder needs room for them.
> Behind NPMplus, add `uploads/[0-9a-f]{32}` with "Disable Request Buffering" to the upload location (see README),
> and a location for `^/api/attachments/[0-9]+/raw$` with "Disable Response Buffering".

### Added

- Folders with a test day, set when creating or under "Edit …"; a test day has at most one folder.
- 📁 in the test day row jumps to the folder, "↑ Date" leads back; every folder has an address and "Copy link".
- Uploads into such folders go in resumable 8 MB chunks, up to the new limit "Video on test day" (default 2048 MB).
- Files on disk under `data/files/`, each encrypted, with range requests for playback.
- "Metrics" shows files on disk, uploads, free space, missing and orphaned files; the owner admin can delete orphans.

### Changed

- Moving a file into a folder with a test day moves it from the database to disk; there is no way back.
- The Backup copies the files on disk to `kriterion-files/` with a list, answers 202 while copying and shows progress.
- A Backup locks the backup folder, also against other installations.
- The Export leaves out large videos and names them beforehand; export format 22 adds the folders' test days.
- `keytool.sh` backs up `data/` without `data/files/`.

## [0.47.1] - 2026-09-29

Fingerprint `a49b4154` — previously `636c7c11`.

### Security

- `nodemailer` 9.1.1 → 10.0.12 (GHSA-6vj9-mwq6-2f5v); version 10 needs Node 20, the image ships Node 22.
- `multer` 2.3.0 → 2.4.0 (GHSA-3pph-fpjx-jg34).

## [0.47.0] - 2026-09-29

Fingerprint `636c7c11` — previously `643e8f9e`.

### Added

- Folders under "Files" with "Add folder": loose files first, then folders, newest on top; all start closed.
- Upload into a folder with its "+" or by dropping onto it; only the folder's creator can upload into it.
- "Move to …" in the menu of your own file; address, thumbnail and "Editable by all" stay.
- Folder menu with "Edit …" and "Delete folder"; the files of a deleted folder become loose files.
- ✕ in a file's own view returns to the entry.

### Changed

- Export format 21 carries folders, video thumbnails and durations; Import and "Trash" restore them.
- ← and → in full screen stay within the file's group.
- A bare 403 shows "The reverse proxy in front refused the request (403)."
- The delete dialogs for entries and accounts name the folders.
- README: the 10 MB limit of the CrowdSec WAF and the exception in NPMplus.

## [0.46.0] - 2026-09-28

Fingerprint `643e8f9e` — previously `6935aee7`.

### Added

- Videos under "Files" (MP4, M4V, WebM, MOV) play full screen, also on iPhone; ← → page through images and videos.
- Video tiles show a thumbnail with ▶ and duration, made by the uploader's browser at upload or when the entry opens.
- "Use this frame as thumbnail" in the ⋯ menu and in full screen of your own video.
- If the browser cannot play a video, full screen says so and offers "Download".

### Changed

- With a video focused, ← and → skip 5 seconds; without focus they page as before.
- A video file's address opens the entry in full screen, also from references in comments and descriptions.
- Every file is served with range requests, so videos can be seeked.
- A video too large for the photo strip but under the "Attachment" limit is pointed to the "Files" block.
- Thumbnail and duration come back from "Trash"; after an Import the thumbnail is created again.

## [0.45.0] - 2026-09-28

Fingerprint `6935aee7` — previously `46ae4e39`.

### Added

- "Files" shows square tiles with thumbnail or extension, name and size (128 px on desktop, 96 px on phones).
- A ⋯ menu on every tile, always visible, offers only what the server allows.
- Upload with the "+" tile or by dropping files; each file shows progress, with "Cancel" and "Try again".
- Uploads continue when you switch entries; tiles and menu items are keyboard-reachable (Shift+F10 opens the menu).

### Changed

- A click never downloads: images open full screen, PDF, text and Office files a preview, other files their menu.
- An image file's address opens the entry in full screen, also from references in comments and descriptions.
- An entry holds 100 files instead of 20; one upload still takes 20.
- The tiles replace the file row whose buttons only appeared on hover.

## [0.44.2] - 2026-09-27

Fingerprint `46ae4e39` — previously `8237adde`.

### Changed

- The link list shows the account name in its own column before ↗, as for files, also on phones.

## [0.44.1] - 2026-09-27

Fingerprint `8237adde` — previously `37520fc0`.

### Added

- "Copy link" on the large image of an entry, next to the crop button.

### Fixed

- Size, account, ▸ and buttons in file rows now line up in fixed columns on desktop.

## [0.44.0] - 2026-09-27

Fingerprint `37520fc0` — previously `0c19372c`.

### Added

- A file or photo address in a comment or description becomes a reference; a Document Server file opens a viewer.
- "Copy link" in every file row and in photo full screen; `#/item/<Eintrag>/photo/<Foto>` opens that photo.
- Image files get a thumbnail tile like photos (existing ones on first display); Export, Import and "Trash" skip it.

### Changed

- A file's own view also shows images, PDF and text; other files download there with ↓.

### Fixed

- With more than 200 comment references in an entry, the rest showed as "deleted".

## [0.43.2] - 2026-09-27

Fingerprint `0c19372c` — previously `66001468`.

### Added

- A pencil appears only on files you may edit and opens them for editing; ⤢ now always opens for viewing.
- "Documents" in "Personal": Document Server theme ("Like Kriterion", "Modern light", "Modern dark") and upload default.
- The uploader toggles "Editable by all" in the file row with the two-person icon.

### Changed

- From the second account on, every file and link shows its uploader's name.
- The upload has no tick anymore; the "Documents" card switch is the default for accounts without their own.

### Fixed

- Returning from a file's own view now shows the file's row instead of the top of the entry.

## [0.43.1] - 2026-09-27

Fingerprint `66001468` — previously `c83a6a27`.

> If the old interface still shows after the update, reload once without cache (Ctrl+Shift+R).

### Fixed

- After an update, browsers kept the old interface for up to an hour; compressed files now carry `Cache-Control`.

## [0.43.0] - 2026-09-27

Fingerprint `c83a6a27` — previously `90d99a0b`.

### Added

- Office files can be edited through the Document Server in their own view, by the uploader.
- "Editable by all" (preset on the "Documents" card) lets every account edit; otherwise admins can only delete.
- The version before the last edit is kept ("Restore previous version").

### Changed

- Editing turns `.doc`, `.xls` and `.ppt` into `.docx`, `.xlsx` and `.pptx` after asking; the old file is kept.
- Export format 20 carries the tick per file; the previous version is only in the Backup.

## [0.42.3] - 2026-09-26

Fingerprint `90d99a0b` — previously `59983d51`.

### Added

- A full-screen button in a file's own view shows only the document, also in landscape on phones; Back or Esc ends it.

### Changed

- The "Documents" card shows each variable name small above its value.

## [0.42.2] - 2026-09-26

Fingerprint `59983d51` — previously `526a9c34`.

### Changed

- A file's own view fills the window without the Kriterion header: only back, file name and download.

### Fixed

- The hint below the viewer was cut off in a file's own view.

## [0.42.1] - 2026-09-26

Fingerprint `526a9c34` — previously `48829449`.

### Added

- ⤢ opens an Office file in its own full-window view; on phones a tap on the file does.

### Changed

- The viewer shows the signed-in account without asking for a name and hides chat and comments; phones get it embedded.

### Fixed

- Umlauts in uploaded file names were garbled ("Ömer" became "Ãmer"); names already stored stay as they are.
- The viewer stayed empty on phones; long addresses overflowed the "Documents" card.

## [0.42.0] - 2026-09-25

Fingerprint `48829449` — previously `dcbfdfb6`.

> A Document Server in the same Docker network needs `ALLOW_PRIVATE_IP_ADDRESS=true`, or it cannot fetch files.
> Every file it shows stays unencrypted in its cache. Without the new `.env` variables nothing changes.

### Added

- View Word, Excel, PowerPoint and OpenDocument files through a Document Server (Euro-Office, OnlyOffice); see README.
- "Documents" card under "Installation": switch for admins and a connection check in both directions.
- `.env`: `DOCUMENT_SERVER_ADDRESS`, `DOCUMENT_SERVER_SECRET`, `DOCUMENT_SERVER_INTERNAL_ADDRESS`, `INTERNAL_ADDRESS`.

### Changed

- With `DOCUMENT_SERVER_ADDRESS` set, the CSP allows scripts and frames from that address.

## [0.41.1] - 2026-09-25

Fingerprint `dcbfdfb6` — previously `d5aaeb21`.

### Added

- The set-password page says an admin can create a new link; the README explains how to restore a Backup.

### Changed

- Interface texts are aligned in German, English and Turkish: full sentences, shorter hints, bold instead of capitals.
- The role with all rights is "Owner admin" (German "Eigentümer-Admin", Turkish "Sahip yönetici").
- "Account" replaces the German "Zugang" and "Konto"; Update, Backup, Migration, Link, Cookie and Login stay English.
- Upload hints name the configured limit instead of a fixed 50 MB or 20 MB.
- The README covers installation and operation, the manual covers usage; `.env.example` covers only its three settings.

### Fixed

- Several English and Turkish sentences were cut off or ungrammatical.
- The README gave the export limit as 512 MB per file; it is about 345 MB per entry.
- `.env.example` pointed to the "Encryption" card for the key value; it is on the "Metrics" card.

## [0.41.0] - 2026-09-23

Fingerprint `d5aaeb21` — previously `7681fc64`.

> Recreating `docker-compose.yml` from the example: set both paths back to `kriterion-sicherung` and `/app/sicherung`.
> Commands of `usertool.js` and `keytool.sh`: `list`, `password`, `remove`, `owner`, `twofactor`, `show`, `change`.
> When you raise an upload limit, raise the reverse proxy's limit too (nginx: `client_max_body_size`).

### Added

- Comments take videos (MP4, WebM, MOV up to 20 MB; six images and videos at most); photos and videos can be downloaded.
- "Upload limits" card under "Database" for photo, comment image, video, comment video and attachment; owner admin only.
- A limit of about 345 MB per entry: uploads above it are refused, the export in parts leaves such an entry out.
- A 413 from the reverse proxy is explained on screen.
- Dialogs and cards say what Export, Import and Backup contain; after an Import the message names reassigned authors.

### Changed

- New installations get English names, such as `kriterion-backup`, `/app/backup` and `photo-<Nummer>`.
- "Backup" is the word used in the interface, manual and README; export format 19 adds comment videos.
- `.env.example` and `docker-compose.example.yml` are shorter.

### Fixed

- The timeline hint ran off the edge; the formatting bar of a long comment sat below the field or off screen.
- After switching `BEHIND_PROXY`, writes were refused until a reload; the server now deletes the stale CSRF cookie.

### Removed

- The German commands of `usertool.js` and `keytool.sh`.

## [0.40.0] - 2026-09-22

Fingerprint `7681fc64` — previously `9d48cbbc`.

### Added

- A dialog before Export and Import: it may take a while, shows no progress, and the window must stay open.

### Changed

- The Export is one file again at any size; it streams (320 MB file: +315 MB memory instead of +1,126 MB).
- The Import reads the file entry by entry from `DATA_DIR/import`, which is emptied at every start.
- The import file limit rises from 900 MB to 4 GB; free space is checked before the upload.

### Fixed

- On phones, the calculation table behind the score showed one letter per line.

### Removed

- The refusal "this export would be too large"; the export in parts keeps its limit per part.

## [0.39.1] - 2026-09-22

Fingerprint `9d48cbbc` — previously `2ba1c469`.

> Rename German names in `.env` before updating, or they fall back to defaults: `HINTER_PROXY` → `BEHIND_PROXY`,
> `OEFFENTLICHE_ADRESSE` → `PUBLIC_ADDRESS`, `SICHERUNG_DIR` → `BACKUP_DIR`, `NEUER_SCHLUESSEL` → `NEW_KEY`.

### Changed

- The notice about an incomplete database points to the Backup instead of an older version.

### Fixed

- `.env.example` named `./schluessel.sh` instead of `keytool.sh`; the manual gave export format 17 instead of 18.

### Removed

- The four German environment variable names and the startup warnings about `AUTH_RESET`, `AUTH_USER`, `AUTH_PASSWORD`.
- `tools/reorder.js` and four other one-off tools; six tables are no longer read under their old German names.
- Upgrade paths through earlier versions from README, manual and `.env.example`.

## [0.39.0] - 2026-09-22

Fingerprint `2ba1c469` — previously `236d515e`.

### Added

- Optional: `tools/reorder.js` (`zeigen`, `umschichten`) reorders an existing database (stopped, 3× its size free).

### Changed

- `data` now comes last in `photos`, `comment_images` and `attachments`: a tile loads in 0.01 ms instead of 0.91 ms.

## [0.38.6] - 2026-09-21

Fingerprint `236d515e` — previously `c4185d0a`.

### Added

- Kriterion is under the MIT license (`LICENSE`, `package.json`); the README lists dependency licenses such as libvips.
- The README says the code was written with Claude Code, August to September 2026, from the project owner's idea.

## [0.38.5] - 2026-09-21

Fingerprint `c4185d0a` — previously `246372bd`.

### Added

- README and manual have a table of contents; new README sections: requirements, folder layout, troubleshooting.

### Changed

- The calculation table no longer scrolls sideways on phones.
- The bell panel's count line is shorter (`12 Kommentare · @34 · ★56`); the long form is in the tooltip.
- The instance now really starts on an incomplete database and writes nothing to it at startup.

### Fixed

- The Fingerprint published for 0.38.4 was wrong: `0d3111e4` belongs to no commit, the measured value is `246372bd`.

## [0.38.4] - 2026-09-21

Fingerprint `246372bd` — previously `a91efceb`.

### Added

- Three indexes, built at the first start (slower on large databases), speed up criteria counts, file lists and tiles.

### Changed

- New installations get the bundled criteria in the install language, e.g. "Appearance"; existing ones are unchanged.
- The comment field mentions the clipboard instead of Ctrl+V.

### Fixed

- A reference to a deleted comment stayed a raw address that opened a new tab; it now shows "deleted".

## [0.38.3] - 2026-09-20

Fingerprint `a91efceb` — previously `383b2511`.

### Changed

- A reference within the open entry scrolls smoothly to the comment instead of redrawing the page.

### Fixed

- After a jump, the target row now stays in place for 1.6 s while references and previews load.
- A reference used twice in one view became a box only once; a failed `GET /api/comment-refs` retried at once.

## [0.38.2] - 2026-09-20

Fingerprint `383b2511` — previously `f86abf3b`.

### Changed

- The comment number sits at the far right, after quote, pencil and delete; the quote button has a drawn icon.

### Fixed

- A reference to its own entry without a comment number did not jump; it now goes to the top of the entry.
- A search hit found only in a link target showed no snippet with the term.

## [0.38.1] - 2026-09-20

Fingerprint `f86abf3b` — previously `43f6f1be`.

### Changed

- Every address of this instance becomes a reference, pasted raw or named, with or without comment number.
- The pencil uses the accent colour (contrast 6.22:1 instead of 2.95:1 in dark mode); more room before the delete cross.

### Fixed

- Clicking the comment number copies over plain HTTP too; if copying fails, the message says why.
- Bold on a selected indented line did not work.
- References jumped only on the first click; a failed `GET /api/comment-refs` made them plain links until reload.

## [0.38.0] - 2026-09-19

Fingerprint `43f6f1be` — previously `144a80c7`.

### Added

- Formatting in comments and descriptions: `**fett**`, `_kursiv_`, `[Name](Adresse)`, quotes, lists (CommonMark subset).
- A formatting menu with Ctrl+B and Ctrl+I; the description shows formatted, click it or the pencil to edit.
- Every comment has a number; clicking it copies a link that shows as title and number and jumps to the comment.
- "Reply with quote", for the whole comment or a selection.
- `tools/markupscan.js` counts existing texts that would look different under the new rules.

### Changed

- Export format 18 (older versions show the formatting characters as text); previews and snippets hide the characters.

## [0.37.0] - 2026-09-19

Fingerprint `144a80c7` — previously `88f9dcfb`.

### Changed

- The notice about an incomplete database names the old column name instead of a version.
- `AUTH_RESET` now logs "is no longer read and has no effect".
- The README lists tables and columns under their current names.

## [0.36.0] - 2026-09-19

Fingerprint `88f9dcfb` — previously `0fc33e91`.

> Scripts that write to the API must copy the cookie `kriterion_csrf` (behind a proxy `__Host-kriterion_csrf`)
> into the header `x-csrf-token`; without it every writing route answers 403.

### Security

- Every writing route requires a CSRF token; before, only `SameSite=Lax` protected them.
- The login lockout is stored in the database and survives a restart.
- Every value written into the interface is escaped.

## [0.35.2] - 2026-09-19

Fingerprint `0fc33e91` — previously `10017d45`.

> `GET /api/items/:id/export` is gone and answers 404; scripts use `GET /api/export` or the export in parts.

### Changed

- Container log lines carry an ISO 8601 time in the zone of `TZ` (default UTC); stored times stay UTC.
- The message for a too-large file names the limit.

### Fixed

- Uploading more than 40 photos at once failed completely with "Unexpected field"; the browser now splits the selection.
- Upload refusals appeared in English, and mail errors in the recipient's language; both now use the reader's.

### Removed

- `GET /api/items/:id/export` and the export button at the foot of an entry.

## [0.35.1] - 2026-09-17

Fingerprint `10017d45` — previously `5297965e`.

> If the server does not start and names `data/encryption.key`, that file is damaged. Do not replace it with a new key:
> that loses all data. Restore the file from a backup instead.

### Fixed

- A damaged `data/encryption.key` stops the start; before, SQLCipher failed with "file is not a database".
- A rejected settings request no longer saves part of its values.
- Restoring the same "Trash" row twice at once created the entry twice; the second request now gets 409.

## [0.35.0] - 2026-09-17

Fingerprint `5297965e` — previously `1f76adac`.

> `GET /api/health` is gone; point health checks to `GET /api/config`.

### Added

- A single entry can be downloaded as a file from a button at its foot.
- Responses are compressed: a full page load drops from 1,001,488 to 268,441 bytes.
- Errors without a message key are logged; before, the operator saw only "Unknown error".

### Changed

- An upload with one unsuitable file stores none of its files.
- Two sentences at the star row were German in English and Turkish; they now come from the language files.

### Fixed

- The filters of the "Security log" had no effect since 0.13.0 and always showed the latest 100 rows.

## [0.34.4] - 2026-09-16

### Security

- An invitation or reset link can no longer be used twice at the same moment; the second request is refused.

## [0.34.3] - 2026-09-16

### Changed

- No change to the application; source comments only.

## [0.34.2] - 2026-09-16

### Changed

- The README covers the server; usage moved unchanged to `manual-de.md`.

## [0.34.1] - 2026-09-16

### Changed

- The README is shorter (3,244 to 2,500 lines); every feature is still described.

## [0.34.0] - 2026-09-15

### Changed

- No change to the application; the test suite is split into modules.

## [0.33.2] - 2026-09-15

### Fixed

- The log showed the key `server.backupDirNotSet` instead of a sentence when no backup folder is set up.
- Eleven German sentences in the English log (public address checks, skipped language files) are now English.

## [0.33.1] - 2026-09-15

### Fixed

- The startup log said "Eigener Server" for the mail provider; it now says "Own server".

### Security

- Two moderate vulnerabilities in `qs` (via `express`) are fixed.

## [0.33.0] - 2026-09-14

> Coming from a version before 0.33.0: make a Backup, start 0.32.1 once, stop it, then update.
> Export files with format 13 or older no longer import; import them into 0.32.1 and export them again.

### Added

- At every start, a log notice "this database is incomplete" lists missing columns; the instance still starts.
- The database records the version that created it and the one that opened it last; export format 17 names the version.

### Changed

- The container log is in English; the interface is unchanged.

### Removed

- Adding missing columns at startup, translating old field names on Import, and recreating old JPEG thumbnails.

## [0.32.1] - 2026-09-14

### Changed

- The comment block shows short counts (12 · ⚑3 · ☐3 · ☑2); the full sentence appears on hover.
- Sorting by rating or potential no longer adds a status filter; the status filter is exactly what is shown.
- Five sentences now use the configured vocabulary words; 13 Turkish sentences have correct case endings.

## [0.32.0] - 2026-09-14

### Added

- `@name` mentions an account in notes, reports and tasks; only that account gets a bell notification.
- The bell panel has three sections: "Addressed to me", "My entries", "Everything else".
- "Score" is the fifteenth vocabulary word, with the sort options "Average: Score" and "Last: Score".

### Changed

- Twelve server messages that stayed German on English or Turkish installations now come from the language files.
- The status pills say what they follow ("follows sorting: Untested") and when they were chosen by hand.
- The access request refuses an empty form; "+ Save view" is plain text instead of a pill.

## [0.31.4] - 2026-09-13

### Changed

- Turkish uses the singular after a number ("3 Öğe") and the plural otherwise; German and English are unchanged.

## [0.31.3] - 2026-09-13

### Changed

- All Turkish texts are proofread: Turkish quotation marks, informal address, about twenty wrong sentences fixed.

## [0.31.2] - 2026-09-13

### Changed

- All English texts are proofread: plainer words, "Please" where the German has it, eight garbled sentences fixed.

## [0.31.1] - 2026-09-13

### Changed

- Every language file key holds a whole sentence; custom language files now translate sentences, not fragments.

### Fixed

- English and Turkish instances showed German words in two messages; the import dialog showed the export button's label.

## [0.31.0] - 2026-09-13

### Changed

- German texts are proofread; error messages give the reason briefly and always the way out.

### Fixed

- A refused partial export named wrong parameters; the hint on custom language files did not mention the restart.

## [0.30.3] - 2026-09-12

### Fixed

- On phones, the collapsed tag row shows seven tags in two lines instead of four, and is lower with few tags.

## [0.30.2] - 2026-09-12

### Changed

- "more"/"less" and "Reset tags" are icons with tooltips; the "and"/"Or" switch shows once the cloud is open.

### Fixed

- With a tag filter active, the expanded tag cloud put every tag on its own line.

## [0.30.1] - 2026-09-12

### Changed

- Due dates are coloured by state: open blue, overdue red, done on time green; a task done late stays red.
- On phones, tags and stars are smaller, and test day rows drop the weekday when space runs out.

### Fixed

- Due dates are now visible to everyone who sees the entry, and a done task without a date can get one.

## [0.30.0] - 2026-09-12

> If the startup log shows "PRUEFSCHALTER AKTIV", remove `KRITERION_TESTBENCH` from your `.env`.

### Changed

- The tag row is open whenever the filters are expanded; the "Tags" toggle is gone.
- "Who rated" is now "Who?", so the rating box header fits one line; the box is smaller on phones.
- Due dates show their state in colour; a done task keeps its due date.

### Fixed

- Four German words ("gewichtet", "an", "aus", "eingerichtet") stayed German in English and Turkish.
- A background job ended the whole server if the database was locked at startup; it now retries later.

## [0.29.0] - 2026-09-11

> Make a Backup first: the first start adds the column `due_date` and a unique index on email addresses.
> If two accounts share an email address, the index is skipped; change one (the "Users" card lists them) and restart.

### Added

- "check" on every Backup opens the copy read-only and reports entries, photos, accounts and date range.
- Tasks can have a due date; open tasks are grouped as overdue, today, later and without date.
- "Show files" below the Fingerprint in "Metrics" lists each file's checksum (as `sha256sum | cut -c1-8`).
- An email address can belong to one account only; sorting by title also works from Z to A.

### Changed

- Export format 16; the category box in an entry takes one line, and its field is called "Name".
- The README explains why emails land in spam and how SPF, DKIM and DMARC help.

## [0.28.1] - 2026-09-11

### Changed

- Sorting uses two controls: the field chooses what, a button beside it the direction; saved views still apply.
- Paging between entries moved to two wide buttons "Previous" and "Next" at the foot of the entry.
- "Settings" and, on phones, all subviews lose the search field; on phones, sections collapse and stars are smaller.

### Fixed

- "Title" sorted by modification date after switching sorts; on phones, the favourite star was not aligned right.

## [0.28.0] - 2026-09-11

### Added

- Arrows in the header page from one entry to the next, in the order of the overview with its filter and sort.
- Kriterion can be added to the home screen, with its own icon and the public title as name.
- Entry, "Settings", open tasks and "Comparison" share a header with search field and menu.

### Changed

- Controls are slimmer on phones, and select fields no longer zoom in.

### Fixed

- Commands in "My account" and "Metrics" ran out of narrow cards; a message no longer covers the comparison bar.

## [0.27.0] - 2026-09-10

### Added

- "Image formats" under "Database": PNG, WebP lossless (default, as before) or WebP lossy for clipboard photos.
- The owner admin sets it; the old checkbox is carried over. The card warns that lossy WebP enlarges screenshots.
- "Convert existing images" converts originals and thumbnails in one pass.

### Changed

- New thumbnails are WebP instead of JPEG; existing ones stay until converted. Switching the format converts nothing.

### Fixed

- Comment images were always announced as JPEG; the conversion's completion message was partly German.

## [0.26.0] - 2026-09-10

### Added

- The "Potential" mode can be turned off (owner admin only); stars already given are kept.

### Fixed

- The file picker did not open again after the first image; the session list hid "End all other sessions".
- Search for "ÜBERGROSS" finds "übergroß"; long entry titles wrap on phones; the overview no longer flashes empty.

## [0.25.4] - 2026-09-10

### Fixed

- A Turkish sentence said the opposite of the German; missing singular forms such as "in 1 days" are fixed.

## [0.25.3] - 2026-09-10

### Fixed

- The two fields of a row in the "Vocabulary" card were not aligned when a label wrapped.

## [0.25.2] - 2026-09-10

### Fixed

- The name cards showed wrong notes when the interface language differed; the "Vocabulary" switch now follows them.

## [0.25.1] - 2026-09-10

### Changed

- The fallback note names both languages; Turkish uses `yedekleme` for Backup throughout.

### Fixed

- The count on a language pill and the red frame now apply per card, not across "Rating" and "Potential".

## [0.25.0] - 2026-09-09

> Make a Backup first: the first start adds the columns `product_categories.language` and `rating_criteria.language`.
> Then set the language pill in "Categories" to the language of your names and press "record all as …".

### Added

- Category and criterion names carry their language; export format 15 includes it.
- Language pills show a dot when complete or the number of missing names; incomplete cards get a red frame.
- Borrowed names appear pale and italic with a note; ✕ at a field removes a translation after asking.
- After a change of the default language, the "Languages" card lists what the new language lacks.

### Changed

- A translation equal to the base name is no longer removed on saving.

### Fixed

- Changing the default language moved all base names to the new language.

### Security

- `multer`, `nodemailer`, `sharp` and `body-parser` updated; `npm audit` reports no high vulnerability.

## [0.24.6] - 2026-09-09

> If you changed a criterion's weight while a language other than the default was selected, check its name:
> it may have been overwritten. Rename it back on the pill of the default language.

### Added

- Without a name in the default language, the next available language is shown, and the note names it.

### Fixed

- Changing a criterion's weight renamed it when a language other than the default was selected.
- After a change of the default language, the three admin cards update without a reload.

## [0.24.5] - 2026-09-08

### Fixed

- The language pills above "Categories" and both criteria cards showed the reader's own language instead of theirs.
- A missing translation is now marked, and the rename field no longer saves the fallback name as a translation.

## [0.24.4] - 2026-09-08

> Vocabulary saved under 0.24.3 may hold another language's defaults: check "Settings" → "Inventory" → "Vocabulary"
> and clear and save any field you never filled in.

### Added

- Turkish (`public/languages/tr.json`); after a number, Turkish uses the singular.
- A field to add new entries in the "Categories" and "Tags" cards.

### Fixed

- Search treats `İ`, `I`, `ı` and `i` alike and gives readers of every language the same results.
- Vocabulary entered for one language showed in others; switching your own language now switches the vocabulary.
- The restore button in "Trash" showed its icon code as text; "show all N" and "N active" were always German.

## [0.24.3] - 2026-09-08

> Make a Backup first: the first start adds two tables and rewrites stored values. Existing installations stay German.

### Added

- English (`public/languages/en.json`); each account picks its language in "Appearance", for all its devices.
- The sign-in page uses the default language; without a choice, the browser's `Accept-Language` applies.
- "Languages" card under "Installation" (owner admin): default language and the languages on offer.
- Vocabulary, criteria and categories per language, falling back to the default; export format 14 carries them.
- Any `.json` under `public/languages/` adds a language; a broken file is reported and skipped.

### Fixed

- `<html lang>`, the potential sort's status default, conversion progress and hit sources on tiles work again.

## [0.24.2] - 2026-09-07

> Make a Backup first. If you saved the "Search engines" card under 0.24.1, enter your own search engines again.

### Fixed

- Settings unreadable since 0.24.1 are back: own search engines, the mail setup (emails go out again) and its last test.

## [0.24.1] - 2026-09-07

> Make a Backup first: tables, columns and stored values get English names; older versions cannot read the database.
> In `.env`, rename `OEFFENTLICHE_ADRESSE`, `HINTER_PROXY`, `PORT_VERSATZ`, `SICHERUNG_DIR` and `NEUER_SCHLUESSEL` to
> `PUBLIC_ADDRESS`, `BEHIND_PROXY`, `PORT_OFFSET`, `BACKUP_DIR` and `NEW_KEY`; the old names still work for now.

### Changed

- Database, source code, API roots (`/api/sicherung` → `/api/backup` and eight more) and addresses use English names.
- Old addresses such as `#/einladung/` still work; older export files are translated on Import.

### Fixed

- Photo thumbnails in an entry can be clicked again; tags on a test day show their names again.
- The collapsed "Links" block shows the first rows again; the owner badge and the active dot have their colours back.

## [0.24.0] - 2026-09-06

### Added

- All interface texts live in `public/sprachen/de.json`; without it the server does not start.

### Changed

- "More filters" is a "Tags" toggle in the category row; dates, times, numbers and sorting follow the language.

### Fixed

- The test day timeline was invisible in the light theme.

## [0.23.0] - 2026-09-05

### Added

- A light theme in "Appearance": "Light", "Dark" or "Auto" (follows the system), per account; dark stays the default.

### Changed

- No flash of the wrong theme on load; browser bar and logo follow the theme, full screen stays dark.

## [0.22.1] - 2026-09-05

### Changed

- The image crop can be drawn, moved, and resized at corners and edges.
- Untested entries have no rating box, and the server refuses ratings for them; removing stars still works.
- The score in the header says it is the average over all users and shows only once.

## [0.22.0] - 2026-09-04

### Added

- The photo strip size can be set in "Appearance" (60 to 150 px); the crop can be drawn with the mouse.

### Changed

- New German terms in about 250 texts, e.g. "Einstellungen"; "Rating" is a vocabulary word; shorter card texts.
- Confirmations use Kriterion's own dialogs; deleting a user asks once, with two checkboxes.
- Only the owner admin sees server commands and the plain-text key; only author and admins can delete an entry.
- New look: opaque header, badges for roles, the star reset button at the far right with "Undo".

## [0.21.1] - 2026-09-04

### Added

- Sorting by rating shows only "Tested" entries, by potential only "Untested"; a status pill set by hand overrides it.

## [0.21.0] - 2026-09-04

> Make a Backup first: the first start adds the column `phase` to `rating_criteria`.

### Added

- A second star box "Potential" with its own criteria ("Potential: criteria"), weights, average and sort order.
- Untested entries show "◆ 4.2" on their tile; the comparison shows both groups; export format 13 (`criteriaPhase`).
- × on your own star row resets that criterion.

### Changed

- The entry's state decides which star box is open: "Potential" when untested, "Rating" when tested.

### Removed

- The button "Reset my rating" with `DELETE /api/items/:id/ratings`, and resetting by double click.

### Fixed

- An Import that brings a criterion with the same name in the other star box is refused before anything is written.

## [0.20.1] - 2026-09-03

### Added

- "Old backups" lists every Backup with number, date, age and size, and marks those the next run deletes.

### Changed

- The fields are "Keep at least" and "Delete when older than"; the "Backup" card shows only the latest Backup.

## [0.20.0] - 2026-09-03

### Added

- "Old backups" under "Database" (owner admin) deletes Backups that are not among the newest 3 and older than 30 days.
- A preview lists the files first; a switch (off by default) cleans up after each successful Backup, a button once.
- Only files named `kriterion-….sqlite` are touched; copies from before a key change have their own button.
- Every deleted copy is logged under "Inventory" in the "Security log"; deleted Backups cannot be restored.

## Older versions — 0.10.0 to 0.19.6

- 0.19.6: Leaving an entry right after a crop, a delete or an upload no longer shows a false error.
- 0.19.5: Thumbnails are recreated square and cropped; cropped tiles and strips are sharp.
- 0.19.4: Photo thumbnails are recreated at the size tiles need; tiles were blurry before.
- 0.19.3: `GET /api/items` returns no tags per test day; image conversion runs in its own thread.
- 0.19.2: "Settings" and the overview load faster; a tight crop can be moved in every direction.
- 0.19.1: Only `docker-compose.example.yml` ships; "Image formats" is its own card.
- 0.19.0: Pasted screenshots become lossless WebP; "Convert all PNG to WebP"; tighter crops (`photos.zoom`).
- 0.18.1: "My sessions" shows ten sign-ins again.
- 0.18.0: Search hits show where the term was found, with a snippet; the term is highlighted.
- 0.17.5: Cards with short lists are no longer too tall; the "Security log" is aligned.
- 0.17.4: Cards in a row have the same height; the "Security log" shows 15 rows before it scrolls.
- 0.17.3: "Reset filters" in the sort row; mail delivery is set up in a dialog.
- 0.17.2: Vote counts show from two votes on; the bell no longer reports your own contributions.
- 0.17.1: "Anlage" became "Instanz"; a video no longer restarts when switched to full screen.
- 0.17.0: The bell says what is new and from whom and replaces the filter "New since …".
- 0.16.0: "Settings" has five sections; a bell for news and open tasks; ratings store their time.
- 0.15.1: The rejection reason no longer shows on entries that are not rejected.
- 0.15.0: Filters "Rejected" and "Not rejected"; only the author of a rejection reason rewrites it.
- 0.14.0: A rejection records date, reason and author; a cookie with `%` no longer locks a browser out.
- 0.13.2: A pinned comment had one edge in a different colour.
- 0.13.1: Label and toggle of the filter row are aligned.
- 0.13.0: HTTPS and the home network with the same settings; filters for the "Security log".
- 0.12.4: "Export in parts" with 50 to 300 MB each.
- 0.12.3: The export card shows the expected size; a too-large export is refused beforehand.
- 0.12.2: The preview row no longer leaves an empty strip on phones.
- 0.12.1: The buttons of the image area sit in one row at the top right.
- 0.12.0: Kriterion works on phones and tablets.
- 0.11.0: Search runs on the server and also finds comments, links and test days; saved views.
- 0.10.0: Optional second factor with an authenticator app; Semantic Versioning and Keep a Changelog.

## 0.9.1 — Self-registration

- "Request access" on the sign-in page (off by default): the address is confirmed by email, then an admin decides.
- Needs mail setup and `OEFFENTLICHE_ADRESSE`; admins approve on the "Requests" card. Make a Backup first.

## 0.9.0 — The server sends email itself

- The owner admin sets up SMTP on the "Mail delivery" card, with a test email; links go out as plain-text email.
- New dependency nodemailer (update with `--build`); accounts get an email address; opened links expire after 15 min.

## 0.8.91 — The key can be changed

- The encryption key can be changed on the host; the old value stays commented out in `.env` and opens older Backups.
- Make a Backup first and try it on a test instance; the "Backup" card marks copies made with the old key.

## 0.8.90 — Critical actions

- Critical actions ask for your password a second time; the "Security log" records sign-ins and instance-wide changes.
- Optional `OEFFENTLICHE_ADRESSE` in `.env`. Make a Backup of the data folder first.

## 0.8.80 — Invitation, reset, sessions

- Accounts are created and passwords reset with a link valid for seven days and once; nothing is sent by email.
- "My sessions" lists your sign-ins and ends them one by one. Make a Backup of the data folder first.

## 0.8.71 — The backup location moves

- The backup location is in the project folder, as the "Backup" card shows; update `docker-compose.yml` along with it.

## 0.8.70 — Backup and trash

- "Trash" (admins see it, the owner admin restores); Backup on demand outside the project folder, pausing the instance.
- A single entry can be downloaded as a file. Make a Backup of `data` first and use the new `docker-compose.yml`.

## 0.8.60 — What is open, what is new

- "Open tasks" lists all unfinished tasks, with "mine / all"; the filter "New since …" shows what changed.
- The "Metrics" card names its checksum Fingerprint; the database is not touched.

## 0.8.50 — Short videos with the photos

- Videos up to 20 MB (MP4, WebM, MOV) sit with the photos; export format 10 includes them. Back up `data` first.

## 0.8.40 — Weighted rating criteria

- Each rating criterion has a weight from 0.2 to 2 (all at 1 changes nothing); export format 9. Back up `data` first.

## 0.8.31 — Files get an author

- From two accounts on, other people's file rows show the uploader's name; export format 8. Back up `data` first.

## 0.8.30 — The link list gets an author

- From two accounts on, link rows show their author; delete dialogs count links; export format 7. Back up first.

## 0.8.20 — Hardening

- Photos are checked by content; a `Content-Security-Policy`, a container health check and clean shutdown.
- Optional `HINTER_PROXY` in `.env`, empty without a reverse proxy; SVG photos from before are served as downloads.

## 0.8.10 — Tooling

- The Fingerprint in the "Metrics" card; the build is reproducible.
- `sharp` 0.35.3 and Node 22 in the image; update with `--build`.

## 0.8.6 — Fixes from operation

- Only admins see who gave which rating; average and number of raters stay visible to everyone.
- The header shows who is signed in; "Created by" shows the date; the link list is cut off instead of scrolling.

## Older versions — 0.8.5 and earlier

These versions had no changelog, and a Fingerprint exists only since 0.8.10.

- 0.8.0 to 0.8.5: three roles, locking, sign-in throttling, `zugang.js`; 0.8.1 needs a database from 0.8.0 or newer.
- 0.7.0 to 0.7.2: own stars beside average and count, permission checks on the server, authors in Export and Import.
- 0.6.0 to 0.6.6: multi-user basis, authors for entries, comments and test days, favourites and settings per user.
- 0.5.0 to 0.5.11: first sign-in with a stored password hash, the name "Kriterion", tasks, clickable links.
- 0.4.7 to 0.4.10 and 4.1 to 4.5: phone use, attachments, tags on test days, timeline, vocabulary, criteria.
- 4.0 and older are not documented; their databases cannot be taken over.
