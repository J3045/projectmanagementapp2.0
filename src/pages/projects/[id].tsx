import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ProjectDetail = () => {
  const router = useRouter();
  const { id } = router.query; // Get dynamic ID from URL
  const [project, setProject] = useState<{ id: string; name: string; description: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/projects/${id}`)
        .then((res) => res.json())
        .then((data) => setProject(data))
        .catch((err) => console.error("Failed to fetch project:", err));
    }
  }, [id]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{project.name}</h1>
      <p className="text-gray-600 mt-2">{project.description}</p>
    </div>
  );
};

export default ProjectDetail;
