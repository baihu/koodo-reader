import React from "react";
import ImportDialog from "../../components/dialogs/importDialog";

const CloudLibrary = () => {
  const EmbeddedImportDialog = ImportDialog as any;
  return <EmbeddedImportDialog embedded />;
};

export default CloudLibrary;
