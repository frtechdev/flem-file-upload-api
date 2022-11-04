CREATE TABLE [Files] (
  [id] String PRIMARY KEY,
  [name] String UNIQUE NOT NULL,
  [originalName] String NOT NULL,
  [path] String NOT NULL,
  [contentType] String NOT NULL,
  [fileLength] String NOT NULL,
  [referenceObjId] String NOT NULL,
  [appSource] String NOT NULL,
  [isDeleted] Boolean NOT NULL DEFAULT (false),
  [createdBy] String NOT NULL DEFAULT 'SISTEMA',
  [updatedBy] String NOT NULL DEFAULT 'SISTEMA',
  [createdAt] DateTime NOT NULL DEFAULT (now()),
  [updatedAt] DateTime NOT NULL
)
GO
