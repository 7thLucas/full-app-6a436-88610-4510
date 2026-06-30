import { useEffect } from "react";
import { Link } from "react-router";
import { FolderOpen, Video, ArrowRight, Plus } from "lucide-react";
import { useProjects } from "~/modules/meetings/hooks/use-meetings";

export default function ProjectsPage() {
  const { projects, loading, fetchProjects } = useProjects();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} active {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <Link
          to="/app/meetings/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-card border border-border rounded-lg py-16 text-center">
          <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create meetings and assign them to projects
          </p>
          <Link
            to="/app/meetings/new"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Upload Recording
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/app/meetings?projectId=${encodeURIComponent(project.id)}`}
              className="bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">{project.name}</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Video className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {project.meetingCount} {project.meetingCount === 1 ? "meeting" : "meetings"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
