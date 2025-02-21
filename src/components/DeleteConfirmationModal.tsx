interface DeleteConfirmationModalProps {
    deleteConfirmation: { projectId: number; projectName: string } | null;
    setDeleteConfirmation: (confirmation: null) => void;
    handleDeleteProject: () => void;
    loadingProjectId: number | null;
  }
  
  export const DeleteConfirmationModal = ({
    deleteConfirmation,
    setDeleteConfirmation,
    handleDeleteProject,
    loadingProjectId,
  }: DeleteConfirmationModalProps) => {
    if (!deleteConfirmation) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-xl font-semibold mb-4">
            Are you sure you want to delete "{deleteConfirmation.projectName}"?
          </h2>
          <div className="flex justify-end gap-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
              onClick={() => setDeleteConfirmation(null)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              onClick={handleDeleteProject}
            >
              {loadingProjectId === deleteConfirmation.projectId ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  };