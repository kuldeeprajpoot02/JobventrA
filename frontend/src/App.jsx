
import { useEffect, useState } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

function App() {
  const [page, setPage] = useState("login");
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("jobventra_theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("jobventra_theme", darkMode ? "dark" : "light"); } catch {}
  }, [darkMode]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // My Applications state
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");

  // Jobseeker profile and resume state
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    headline: "",
    skills: "",
    education: "",
    experience: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [profileResumeUrl, setProfileResumeUrl] = useState("");

  // Recruiter dashboard state
  const [recruiterApplications, setRecruiterApplications] = useState([]);
  const [recruiterLoading, setRecruiterLoading] = useState(false);
  const [recruiterError, setRecruiterError] = useState("");
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    jobType: "Full-time",
    salary: "",
    description: "",
    skills: "",
  });
  const [postingJob, setPostingJob] = useState(false);
  const [updatingApplication, setUpdatingApplication] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [markingNotification, setMarkingNotification] = useState("");

  // Job search aur filters
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");

  // Saved login restore karein
  useEffect(() => {
    const savedToken = localStorage.getItem("hireorbit_token");
    const savedUser = localStorage.getItem("hireorbit_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        setPage("jobs");
      } catch {
        localStorage.removeItem("hireorbit_token");
        localStorage.removeItem("hireorbit_user");
      }
    }
  }, []);

  // Jobs load karein
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${API}/jobs`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Jobs load nahi ho sakin.");
        }

        setJobs(data.jobs || []);
      } catch (err) {
        setError(err.message || "Backend se connect nahi ho paya.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Notifications page khulne par logged-in user ki notifications load karein
  useEffect(() => {
    if (page !== "notifications" || !token) return;

    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const response = await fetch(`${API}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Notifications load nahi ho sakin.");
        }

        setNotifications(data.notifications || []);
      } catch (err) {
        setNotificationsError(err.message || "Notifications load nahi ho sakin.");
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [page, token]);

  // My Applications page khulne par applications load karein
  useEffect(() => {
    if (page !== "applications" || !token) return;

    const fetchMyApplications = async () => {
      setApplicationsLoading(true);
      setApplicationsError("");

      try {
        const response = await fetch(`${API}/applications/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 401 || response.status === 403) {
            throw new Error(
              "Login session expire ho gaya hai. Dobara login karein."
            );
          }

          throw new Error(
            data.message || "Applications load nahi ho sakin."
          );
        }

        setApplications(data.applications || []);
      } catch (err) {
        setApplicationsError(
          err.message || "Applications load nahi ho sakin."
        );
      } finally {
        setApplicationsLoading(false);
      }
    };

    fetchMyApplications();
  }, [page, token]);

  // Profile page khulne par latest profile load karein
  useEffect(() => {
    if (page !== "profile" || !token) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError("");

      try {
        const response = await fetch(`${API}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
          throw new Error(data.message || "Profile load nahi ho payi.");
        }

        const profile = data.user;
        setProfileForm({
          name: profile.name || "",
          phone: profile.phone || "",
          headline: profile.headline || "",
          skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
          education: profile.education || "",
          experience: profile.experience || "",
          linkedinUrl: profile.linkedinUrl || "",
          githubUrl: profile.githubUrl || "",
          portfolioUrl: profile.portfolioUrl || "",
        });
        setProfileResumeUrl(profile.resumeUrl || "");
      } catch (err) {
        setProfileError(err.message || "Profile load nahi ho payi.");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [page, token]);

  // Recruiter dashboard khulne par applications load karein
  useEffect(() => {
    if (page !== "recruiter" || !token || user?.role !== "recruiter") return;

    const fetchRecruiterApplications = async () => {
      setRecruiterLoading(true);
      setRecruiterError("");

      try {
        const response = await fetch(`${API}/applications/recruiter`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Applications load nahi ho sakin.");
        }

        setRecruiterApplications(data.applications || []);
      } catch (err) {
        setRecruiterError(err.message || "Applications load nahi ho sakin.");
      } finally {
        setRecruiterLoading(false);
      }
    };

    fetchRecruiterApplications();
  }, [page, token, user]);

  // Search aur filters
  const filteredJobs = jobs.filter((job) => {
    const keyword = searchTerm.trim().toLowerCase();
    const location = locationFilter.trim().toLowerCase();

    const matchesKeyword =
      !keyword ||
      [
        job.title,
        job.company,
        job.description,
        ...(job.skills || []),
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        );

    const matchesLocation =
      !location ||
      (job.location || "").toLowerCase().includes(location);

    const matchesJobType =
      !jobTypeFilter || job.jobType === jobTypeFilter;

    return matchesKeyword && matchesLocation && matchesJobType;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("");
    setJobTypeFilter("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const endpoint =
        page === "register" ? "/auth/register" : "/auth/login";

      const body =
        page === "register"
          ? { name, email, password }
          : { email, password };

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Request complete nahi hui.");
      }

      if (page === "register") {
        setMessage("Account ban gaya! Ab apne account mein login karein.");
        setPage("login");
        setPassword("");
        return;
      }

      if (!data.token || !data.user) {
        throw new Error("Login response mein token ya user nahi mila.");
      }

      localStorage.setItem("hireorbit_token", data.token);
      localStorage.setItem("hireorbit_user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setPassword("");
      setApplications([]);
      setPage("jobs");
      setMessage("Login successful! JobventrA mein aapka swagat hai.");
    } catch (err) {
      setError(err.message || "Kuch galat ho gaya.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hireorbit_token");
    localStorage.removeItem("hireorbit_user");

    setToken("");
    setUser(null);
    setPassword("");
    setApplications([]);
    setNotifications([]);
    setPage("login");
    setMessage("Aap logout ho gaye hain.");
    setError("");
    setApplicationsError("");
  };

  const handleApply = async (jobId) => {
    setMessage("");
    setError("");

    if (!token) {
      setPage("login");
      setError("Apply karne ke liye pehle login karein.");
      return;
    }

    setApplyingJob(jobId);

    try {
      const response = await fetch(`${API}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Application submit nahi hui.");
      }

      setMessage(
        data.message || "Application successfully submit ho gayi."
      );
    } catch (err) {
      setError(err.message || "Application submit nahi ho payi.");
    } finally {
      setApplyingJob("");
    }
  };

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm((current) => ({ ...current, [name]: value }));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!token || user?.role !== "recruiter") {
      setError("Job post karne ke liye recruiter account se login karein.");
      return;
    }

    setPostingJob(true);

    try {
      const response = await fetch(`${API}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...jobForm,
          salary: jobForm.salary.trim() || "Not disclosed",
          skills: jobForm.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Job post nahi ho payi.");
      }

      setJobs((current) => [data.job, ...current]);
      setJobForm({
        title: "",
        company: "",
        location: "",
        jobType: "Full-time",
        salary: "",
        description: "",
        skills: "",
      });
      setMessage("Job successfully post ho gayi!");
    } catch (err) {
      setError(err.message || "Job post nahi ho payi.");
    } finally {
      setPostingJob(false);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    setRecruiterError("");
    setMessage("");
    setUpdatingApplication(applicationId);

    try {
      const response = await fetch(
        `${API}/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Status update nahi ho saka.");
      }

      setRecruiterApplications((current) =>
        current.map((application) =>
          application._id === applicationId
            ? { ...application, status: data.application.status }
            : application
        )
      );
      setMessage("Application status update ho gaya.");
    } catch (err) {
      setRecruiterError(err.message || "Status update nahi ho saka.");
    } finally {
      setUpdatingApplication("");
    }
  };

  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setProfileError("");
    setSavingProfile(true);

    try {
      const response = await fetch(`${API}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profileForm,
          skills: profileForm.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Profile save nahi ho payi.");
      }

      if (data.user) {
        setUser((current) => {
          const updatedUser = { ...current, ...data.user };
          localStorage.setItem("hireorbit_user", JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
      setMessage(data.message || "Profile successfully update ho gayi.");
    } catch (err) {
      setProfileError(err.message || "Profile save nahi ho payi.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setProfileError("");

    if (!resumeFile) {
      setProfileError("Pehle PDF resume select karein.");
      return;
    }
    if (resumeFile.type !== "application/pdf" || !resumeFile.name.toLowerCase().endsWith(".pdf")) {
      setProfileError("Sirf PDF resume upload karein.");
      return;
    }
    if (resumeFile.size > 5 * 1024 * 1024) {
      setProfileError("Resume file 5 MB se chhoti honi chahiye.");
      return;
    }

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);

      const response = await fetch(`${API}/users/profile/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Resume upload nahi ho paya.");
      }

      setProfileResumeUrl(data.resumeUrl || "");
      setResumeFile(null);
      e.target.reset();
      setMessage(data.message || "Resume successfully upload ho gaya.");
    } catch (err) {
      setProfileError(err.message || "Resume upload nahi ho paya.");
    } finally {
      setUploadingResume(false);
    }
  };

  // Securely download the logged-in user's resume using the JWT token
  const handleResumeDownload = async () => {
    setProfileError("");
    setMessage("");

    if (!token) {
      setProfileError("Resume download karne ke liye dobara login karein.");
      return;
    }

    if (!profileResumeUrl) {
      setProfileError("Pehle apna PDF resume upload karein.");
      return;
    }

    setDownloadingResume(true);

    try {
      const response = await fetch(`${API}/users/profile/resume`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = "Resume download nahi ho paya.";
        try {
          const data = await response.json();
          errorMessage = data.message || errorMessage;
        } catch {
          // Keep the fallback message if the response isn't JSON.
        }
        throw new Error(errorMessage);
      }

      const resumeBlob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(resumeBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "my-resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setMessage("Resume download shuru ho gaya.");
    } catch (err) {
      setProfileError(err.message || "Resume download nahi ho paya.");
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    if (!token) return;
    setMarkingNotification(notificationId);
    setNotificationsError("");

    try {
      const response = await fetch(`${API}/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Notification update nahi ho saki.");
      }

      setNotifications((current) =>
        current.map((item) =>
          item._id === notificationId ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      setNotificationsError(err.message || "Notification update nahi ho saki.");
    } finally {
      setMarkingNotification("");
    }
  };

  const switchPage = (nextPage) => {
    setPage(nextPage);
    setMessage("");
    setError("");
    setApplicationsError("");
    setPassword("");
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date unavailable";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    const colors = {
      Applied: { background: "#dbeafe", color: "#1d4ed8" },
      "Under Review": { background: "#fef3c7", color: "#92400e" },
      Shortlisted: { background: "#dcfce7", color: "#166534" },
      Rejected: { background: "#fee2e2", color: "#b91c1c" },
    };

    return {
      ...styles.statusBadge,
      ...(colors[status] || {
        background: "#e2e8f0",
        color: "#334155",
      }),
    };
  };

  return (
    <div className={`hireorbit-page ${darkMode ? "theme-dark" : "theme-light"}`} style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { width: 100%; min-width: 0; margin: 0; }
        .hireorbit-page { width: 100%; min-width: 0; overflow-x: hidden; }
        .hireorbit-header { }
        .hireorbit-main { width: 100%; }
        .theme-dark { background: #0b1120 !important; color: #e5e7eb !important; }
        .theme-dark .hireorbit-main { color: #e5e7eb !important; }
        .theme-dark .hireorbit-panel, .theme-dark .hireorbit-card, .theme-dark .hireorbit-filter, .theme-dark .hireorbit-auth { background: #111c32 !important; color: #e5e7eb !important; border-color: #334155 !important; }
        .theme-dark .hireorbit-page, .theme-dark p, .theme-dark label, .theme-dark h2, .theme-dark h3, .theme-dark h4, .theme-dark strong, .theme-dark span { color: inherit; }
        .theme-dark input, .theme-dark select, .theme-dark textarea { background: #0f172a !important; color: #f8fafc !important; border-color: #475569 !important; }
        .theme-dark input::placeholder, .theme-dark textarea::placeholder { color: #94a3b8 !important; }
        .theme-dark .hireorbit-card p, .theme-dark .hireorbit-panel p { color: #cbd5e1 !important; }
        .theme-dark .hireorbit-header { background: #070d1b !important; }
        .theme-dark .hireorbit-footer { background: #070d1b !important; }
        .theme-dark .hireorbit-card button, .theme-dark .hireorbit-panel button { border-color: #475569; }
        .theme-toggle { border: 1px solid #64748b; border-radius: 999px; padding: 9px 13px; background: #1e293b; color: #f8fafc; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .theme-light .hireorbit-main { background: transparent; }
        @media (max-width: 768px) {
          .hireorbit-header { padding: 18px 16px !important; flex-direction: column !important; align-items: stretch !important; gap: 14px !important; }
          .hireorbit-header h1 { font-size: 28px !important; line-height: 1.2 !important; }
          .hireorbit-nav { width: 100%; display: flex !important; flex-wrap: wrap !important; gap: 8px !important; align-items: stretch !important; }
          .hireorbit-nav > span { width: 100%; margin-bottom: 4px; overflow-wrap: anywhere; }
          .hireorbit-nav > button { flex: 1 1 135px; min-height: 42px; white-space: normal; }
          .hireorbit-main { padding: 22px 12px !important; }
          .hireorbit-footer { padding: 28px 18px 16px !important; }
          .hireorbit-footer-content { grid-template-columns: minmax(0, 1fr) !important; gap: 18px !important; padding-bottom: 20px !important; }
          .hireorbit-footer-content h2 { font-size: 25px !important; }
          .hireorbit-footer-content h3 { margin-bottom: 8px !important; }
          .hireorbit-footer-bottom { flex-direction: column !important; }
          .hireorbit-panel { padding: 16px !important; margin-bottom: 18px !important; border-radius: 12px !important; }
          .hireorbit-filter { grid-template-columns: minmax(0, 1fr) !important; padding: 14px !important; gap: 14px !important; }
          .hireorbit-form { grid-template-columns: minmax(0, 1fr) !important; }
          .hireorbit-grid { grid-template-columns: minmax(0, 1fr) !important; gap: 14px !important; }
          .hireorbit-card { padding: 16px !important; min-width: 0; }
          .hireorbit-auth { width: 100%; max-width: 100% !important; margin: 18px auto !important; padding: 20px !important; }
          .hireorbit-page input, .hireorbit-page select, .hireorbit-page textarea, .hireorbit-page button { max-width: 100%; }
          .hireorbit-page input, .hireorbit-page select, .hireorbit-page textarea { font-size: 16px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .hireorbit-header { padding-left: 4% !important; padding-right: 4% !important; }
          .hireorbit-main { padding: 28px 18px !important; }
          .hireorbit-grid { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)) !important; }
        }
      `}</style>
      <header className="hireorbit-header" style={styles.header}>
        <div>
          <h1 style={styles.logo}>JobventrA</h1>
          <p style={styles.tagline}>Find your next opportunity.</p>
        </div>
        <button
          type="button"
          className="theme-toggle"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setDarkMode((current) => !current)}
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {user && (
          <div className="hireorbit-nav" style={styles.headerRight}>
            <span>Welcome, {user.name || user.email}</span>

            <button
              type="button"
              style={page === "jobs" ? styles.activeNavButton : styles.navButton}
              onClick={() => switchPage("jobs")}
            >
              Browse Jobs
            </button>

            {user.role !== "recruiter" && (
              <button
                type="button"
                style={page === "profile" ? styles.activeNavButton : styles.navButton}
                onClick={() => switchPage("profile")}
              >
                My Profile
              </button>
            )}

            {user.role !== "recruiter" && (
              <button
                type="button"
                style={
                  page === "applications"
                    ? styles.activeNavButton
                    : styles.navButton
                }
                onClick={() => switchPage("applications")}
              >
                My Applications
              </button>
            )}

            {user.role === "recruiter" && (
              <button
                type="button"
                style={
                  page === "recruiter"
                    ? styles.activeNavButton
                    : styles.navButton
                }
                onClick={() => switchPage("recruiter")}
              >
                Recruiter Dashboard
              </button>
            )}

            <button
              type="button"
              style={page === "notifications" ? styles.activeNavButton : styles.navButton}
              onClick={() => switchPage("notifications")}
            >
              Notifications{notifications.filter((item) => !item.isRead).length > 0
                ? ` (${notifications.filter((item) => !item.isRead).length})`
                : ""}
            </button>

            <button
              type="button"
              style={styles.logoutButton}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="hireorbit-main" style={styles.main}>
        {message && (
          <p role="status" style={styles.success}>
            {message}
          </p>
        )}

        {error && (
          <p role="alert" style={styles.error}>
            {error}
          </p>
        )}

        {(page === "login" || page === "register") && (
          <section style={styles.authCard}>
            <h2>
              {page === "register" ? "Create Your Account" : "Welcome Back"}
            </h2>

            <p style={styles.subtitle}>
              {page === "register"
                ? "Join JobventrA and discover new opportunities."
                : "Login to explore jobs and apply."}
            </p>

            <form onSubmit={handleAuth}>
              {page === "register" && (
                <div style={styles.field}>
                  <label style={styles.label} htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    style={styles.input}
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label} htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  style={styles.input}
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  style={styles.input}
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button style={styles.primaryButton} type="submit">
                {page === "register" ? "Create Account" : "Login"}
              </button>
            </form>

            <p style={styles.switchText}>
              {page === "register"
                ? "Already have an account? "
                : "Don't have an account? "}

              <button
                type="button"
                style={styles.linkButton}
                onClick={() =>
                  switchPage(page === "register" ? "login" : "register")
                }
              >
                {page === "register" ? "Login" : "Register"}
              </button>
            </p>
          </section>
        )}

        {page === "jobs" && (
          <>
            <h2>Find Your Dream Job</h2>
            <p style={styles.subtitle}>
              Search jobs by title, company, location or job type.
            </p>

            <section className="hireorbit-filter" style={styles.filterBox}>
              <div style={styles.filterField}>
                <label style={styles.label} htmlFor="jobSearch">
                  Job Title or Keyword
                </label>
                <input
                  id="jobSearch"
                  style={styles.input}
                  type="search"
                  placeholder="e.g. Java Developer, React..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div style={styles.filterField}>
                <label style={styles.label} htmlFor="jobLocation">
                  Location
                </label>
                <input
                  id="jobLocation"
                  style={styles.input}
                  type="text"
                  placeholder="e.g. Lucknow, Delhi..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>

              <div style={styles.filterField}>
                <label style={styles.label} htmlFor="jobType">
                  Job Type
                </label>
                <select
                  id="jobType"
                  style={styles.input}
                  value={jobTypeFilter}
                  onChange={(e) => setJobTypeFilter(e.target.value)}
                >
                  <option value="">All Job Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <button
                type="button"
                style={styles.clearButton}
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            </section>

            <div style={styles.resultsHeader}>
              <h3>Latest Jobs</h3>
              <span style={styles.resultCount}>
                {filteredJobs.length} job(s) found
              </span>
            </div>

            {loading && <p>Loading jobs...</p>}

            {!loading && jobs.length === 0 && !error && (
              <p>Abhi koi job available nahi hai.</p>
            )}

            {!loading && jobs.length > 0 && filteredJobs.length === 0 && (
              <div style={styles.emptyState}>
                <h3>No jobs found</h3>
                <p>Search ya filters change karke dobara try karein.</p>
                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={clearFilters}
                >
                  Show All Jobs
                </button>
              </div>
            )}

            <div className="hireorbit-grid" style={styles.grid}>
              {filteredJobs.map((job) => (
                <article className="hireorbit-card" key={job._id} style={styles.card}>
                  <h3>{job.title}</h3>
                  <p>
                    <strong>Company:</strong> {job.company}
                  </p>
                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>
                  <p>
                    <strong>Job Type:</strong> {job.jobType}
                  </p>
                  <p>
                    <strong>Salary:</strong> {job.salary || "Not disclosed"}
                  </p>

                  <p style={styles.description}>{job.description}</p>

                  {job.skills?.length > 0 && (
                    <div style={styles.skills}>
                      {job.skills.map((skill, index) => (
                        <span key={`${skill}-${index}`} style={styles.skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {user?.role !== "recruiter" && (
                    <button
                      type="button"
                      style={{
                        ...styles.primaryButton,
                        opacity: applyingJob === job._id ? 0.7 : 1,
                      }}
                      disabled={applyingJob === job._id}
                      onClick={() => handleApply(job._id)}
                    >
                      {applyingJob === job._id ? "Applying..." : "Apply Now"}
                    </button>
                  )}
                </article>
              ))}
            </div>
          </>
        )}

        {page === "notifications" && (
          <>
            <h2>Notifications</h2>
            <p style={styles.subtitle}>
              Apni job applications aur application status se judi updates yahan dekhein.
            </p>

            {notificationsError && <p role="alert" style={styles.error}>{notificationsError}</p>}
            {notificationsLoading && <p>Notifications load ho rahi hain...</p>}

            {!notificationsLoading && notifications.length === 0 && !notificationsError && (
              <div style={styles.emptyState}>
                <h3>Abhi koi notification nahi hai</h3>
                <p>Jab aapki application ya job posting se judi update aayegi, woh yahan dikhegi.</p>
              </div>
            )}

            {!notificationsLoading && notifications.length > 0 && (
              <div style={{ display: "grid", gap: "14px" }}>
                {notifications.map((notification) => (
                  <article
                    key={notification._id}
                    style={{
                      ...styles.dashboardPanel,
                      marginBottom: 0,
                      borderLeft: notification.isRead ? "4px solid #cbd5e1" : "4px solid #2563eb",
                      background: notification.isRead ? "#ffffff" : "#eff6ff",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 260px" }}>
                        <p style={{ marginTop: 0, marginBottom: "8px", fontWeight: "bold" }}>
                          {notification.message}
                        </p>
                        {notification.job?.title && (
                          <p style={{ margin: "0 0 8px", color: "#475569" }}>
                            {notification.job.title}{notification.job.company ? ` — ${notification.job.company}` : ""}
                          </p>
                        )}
                        <small style={{ color: "#64748b" }}>
                          {formatDate(notification.createdAt)} · {notification.isRead ? "Read" : "Unread"}
                        </small>
                      </div>
                      {!notification.isRead && (
                        <button
                          type="button"
                          style={styles.primaryButton}
                          disabled={markingNotification === notification._id}
                          onClick={() => handleMarkNotificationRead(notification._id)}
                        >
                          {markingNotification === notification._id ? "Updating..." : "Mark as Read"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {page === "profile" && user?.role !== "recruiter" && (
          <>
            <h2>My Profile</h2>
            <p style={styles.subtitle}>
              Apni professional details update karein aur apna PDF resume upload karein.
            </p>

            {profileLoading ? (
              <section className="hireorbit-panel" style={styles.dashboardPanel}><p>Profile load ho rahi hai...</p></section>
            ) : (
              <>
                {profileError && <p role="alert" style={styles.error}>{profileError}</p>}

                <section className="hireorbit-panel" style={styles.dashboardPanel}>
                  <h3>Professional Details</h3>
                  <form onSubmit={handleSaveProfile} style={styles.jobForm}>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="profileName">Full Name</label>
                      <input id="profileName" name="name" style={styles.input} value={profileForm.name} onChange={handleProfileFormChange} required />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="profilePhone">Phone</label>
                      <input id="profilePhone" name="phone" style={styles.input} type="tel" value={profileForm.phone} onChange={handleProfileFormChange} placeholder="Phone number (optional)" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="profileHeadline">Professional Headline</label>
                      <input id="profileHeadline" name="headline" style={styles.input} value={profileForm.headline} onChange={handleProfileFormChange} placeholder="e.g. Aspiring MERN Stack Developer" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="profileSkills">Skills</label>
                      <input id="profileSkills" name="skills" style={styles.input} value={profileForm.skills} onChange={handleProfileFormChange} placeholder="JavaScript, React, Node.js" />
                      <small>Skills ko comma se separate karein.</small>
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="profileEducation">Education</label>
                      <input id="profileEducation" name="education" style={styles.input} value={profileForm.education} onChange={handleProfileFormChange} placeholder="e.g. B.Tech CSE" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="profileExperience">Experience</label>
                      <input id="profileExperience" name="experience" style={styles.input} value={profileForm.experience} onChange={handleProfileFormChange} placeholder="e.g. Fresher / Internship" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="profileLinkedin">LinkedIn URL</label>
                      <input id="profileLinkedin" name="linkedinUrl" style={styles.input} type="url" value={profileForm.linkedinUrl} onChange={handleProfileFormChange} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="profileGithub">GitHub URL</label>
                      <input id="profileGithub" name="githubUrl" style={styles.input} type="url" value={profileForm.githubUrl} onChange={handleProfileFormChange} placeholder="https://github.com/..." />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="profilePortfolio">Portfolio URL</label>
                      <input id="profilePortfolio" name="portfolioUrl" style={styles.input} type="url" value={profileForm.portfolioUrl} onChange={handleProfileFormChange} placeholder="https://your-portfolio..." />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <button type="submit" style={styles.primaryButton} disabled={savingProfile}>
                        {savingProfile ? "Saving Profile..." : "Save Profile"}
                      </button>
                    </div>
                  </form>
                </section>

                <section className="hireorbit-panel" style={styles.dashboardPanel}>
                  <h3>Resume Upload</h3>
                  <p style={styles.subtitle}>PDF format only, maximum 5 MB.</p>
                  {profileResumeUrl ? (
                    <>
                      <p role="status" style={styles.success}>Resume uploaded hai. Aap ise download kar sakte hain ya naya PDF select karke replace kar sakte hain.</p>
                      <button
                        type="button"
                        style={styles.primaryButton}
                        onClick={handleResumeDownload}
                        disabled={downloadingResume}
                      >
                        {downloadingResume ? "Downloading Resume..." : "Download Resume"}
                      </button>
                    </>
                  ) : (
                    <p>Abhi koi resume upload nahi hai.</p>
                  )}
                  <form onSubmit={handleResumeUpload}>
                    <div style={styles.field}>
                      <label style={styles.label} htmlFor="resumeFile">Select PDF Resume</label>
                      <input
                        id="resumeFile"
                        style={styles.input}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    {resumeFile && <p>Selected: {resumeFile.name}</p>}
                    <button type="submit" style={styles.primaryButton} disabled={uploadingResume}>
                      {uploadingResume ? "Uploading Resume..." : "Upload Resume"}
                    </button>
                  </form>
                </section>
              </>
            )}
          </>
        )}

        {page === "applications" && (
          <>
            <h2>My Applications</h2>
            <p style={styles.subtitle}>
              Track the jobs you have applied for and check their current status.
            </p>

            {applicationsLoading && (
              <p>Loading your applications...</p>
            )}

            {applicationsError && (
              <div style={styles.error}>
                <p>{applicationsError}</p>
                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() => switchPage("applications")}
                >
                  Try Again
                </button>
              </div>
            )}

            {!applicationsLoading &&
              !applicationsError &&
              applications.length === 0 && (
                <div style={styles.emptyState}>
                  <h3>No applications yet</h3>
                  <p>
                    Aapne abhi kisi job ke liye apply nahi kiya hai.
                    Jobs browse karke apni pehli application submit karein.
                  </p>
                  <button
                    type="button"
                    style={styles.primaryButton}
                    onClick={() => switchPage("jobs")}
                  >
                    Browse Jobs
                  </button>
                </div>
              )}

            {!applicationsLoading &&
              !applicationsError &&
              applications.length > 0 && (
                <>
                  <div style={styles.resultsHeader}>
                    <h3>Your Applied Jobs</h3>
                    <span style={styles.resultCount}>
                      {applications.length} application(s)
                    </span>
                  </div>

                  <div className="hireorbit-grid" style={styles.grid}>
                    {applications.map((application) => {
                      const job = application.job;

                      return (
                        <article
                          key={application._id}
                          style={styles.card}
                        >
                          {job ? (
                            <>
                              <h3>{job.title}</h3>
                              <p>
                                <strong>Company:</strong> {job.company}
                              </p>
                              <p>
                                <strong>Location:</strong> {job.location}
                              </p>
                              <p>
                                <strong>Job Type:</strong> {job.jobType}
                              </p>
                              <p>
                                <strong>Salary:</strong>{" "}
                                {job.salary || "Not disclosed"}
                              </p>
                            </>
                          ) : (
                            <h3>Job details are no longer available</h3>
                          )}

                          <p>
                            <strong>Applied on:</strong>{" "}
                            {formatDate(application.createdAt)}
                          </p>

                          <div style={styles.statusRow}>
                            <strong>Application Status:</strong>
                            <span style={getStatusStyle(application.status)}>
                              {application.status || "Applied"}
                            </span>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </>
              )}
          </>
        )}

        {page === "recruiter" && user?.role === "recruiter" && (
          <>
            <h2>Recruiter Dashboard</h2>
            <p style={styles.subtitle}>
              Nayi jobs post karein aur apni jobs par aaye applications manage karein.
            </p>

            <section className="hireorbit-panel" style={styles.dashboardPanel}>
              <h3>Post a New Job</h3>
              <form onSubmit={handlePostJob} style={styles.jobForm}>
                <div style={styles.field}>
                  <label style={styles.label} htmlFor="jobTitle">Job Title</label>
                  <input id="jobTitle" name="title" style={styles.input}
                    value={jobForm.title} onChange={handleJobFormChange}
                    placeholder="e.g. Java Developer" required />
                </div>

                <div style={styles.field}>
                  <label style={styles.label} htmlFor="jobCompany">Company</label>
                  <input id="jobCompany" name="company" style={styles.input}
                    value={jobForm.company} onChange={handleJobFormChange}
                    placeholder="Company name" required />
                </div>

                <div style={styles.field}>
                  <label style={styles.label} htmlFor="jobPostLocation">Location</label>
                  <input id="jobPostLocation" name="location" style={styles.input}
                    value={jobForm.location} onChange={handleJobFormChange}
                    placeholder="e.g. Lucknow, Uttar Pradesh" required />
                </div>

                <div style={styles.field}>
                  <label style={styles.label} htmlFor="jobPostType">Job Type</label>
                  <select id="jobPostType" name="jobType" style={styles.input}
                    value={jobForm.jobType} onChange={handleJobFormChange}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label} htmlFor="jobSalary">Salary</label>
                  <input id="jobSalary" name="salary" style={styles.input}
                    value={jobForm.salary} onChange={handleJobFormChange}
                    placeholder="e.g. 3-5 LPA (optional)" />
                </div>

                <div style={styles.field}>
                  <label style={styles.label} htmlFor="jobSkills">Skills</label>
                  <input id="jobSkills" name="skills" style={styles.input}
                    value={jobForm.skills} onChange={handleJobFormChange}
                    placeholder="React, Node.js, MongoDB (comma separated)" />
                </div>

                <div style={styles.field}>
                  <label style={styles.label} htmlFor="jobDescription">Description</label>
                  <textarea id="jobDescription" name="description"
                    style={styles.textarea} value={jobForm.description}
                    onChange={handleJobFormChange}
                    placeholder="Describe the role and requirements" required rows={5} />
                </div>

                <button type="submit" style={styles.primaryButton} disabled={postingJob}>
                  {postingJob ? "Posting Job..." : "Post Job"}
                </button>
              </form>
            </section>

            <section className="hireorbit-panel" style={styles.dashboardPanel}>
              <div style={styles.resultsHeader}>
                <h3>Applications for Your Jobs</h3>
                <span style={styles.resultCount}>
                  {recruiterApplications.length} application(s)
                </span>
              </div>

              {recruiterLoading && <p>Loading applications...</p>}
              {recruiterError && <p role="alert" style={styles.error}>{recruiterError}</p>}

              {!recruiterLoading && !recruiterError && recruiterApplications.length === 0 && (
                <div style={styles.emptyState}>
                  <h3>No applications yet</h3>
                  <p>Jab candidates aapki jobs par apply karenge, unki applications yahan dikhengi.</p>
                </div>
              )}

              <div className="hireorbit-grid" style={styles.grid}>
                {recruiterApplications.map((application) => (
                  <article className="hireorbit-card" key={application._id} style={styles.card}>
                    <h3>{application.job?.title || "Job details unavailable"}</h3>
                    <p><strong>Company:</strong> {application.job?.company || "—"}</p>
                    <p><strong>Applicant:</strong> {application.applicant?.name || "Name unavailable"}</p>
                    <p><strong>Email:</strong> {application.applicant?.email || "Email unavailable"}</p>
                    <p><strong>Applied on:</strong> {formatDate(application.createdAt)}</p>

                    <div style={styles.field}>
                      <label style={styles.label} htmlFor={`status-${application._id}`}>
                        Application Status
                      </label>
                      <select
                        id={`status-${application._id}`}
                        style={styles.input}
                        value={application.status || "Applied"}
                        disabled={updatingApplication === application._id}
                        onChange={(e) =>
                          handleUpdateApplicationStatus(application._id, e.target.value)
                        }
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      {updatingApplication === application._id && (
                        <small>Updating status...</small>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="hireorbit-footer" style={styles.footer}>
        <div className="hireorbit-footer-content" style={styles.footerContent}>
          <div style={styles.footerBrand}>
            <h2 style={styles.footerLogo}>JobventrA</h2>
            <p style={styles.footerText}>Find opportunities. Build your future.</p>
            <p style={styles.footerMuted}>Connecting talent with the right opportunities.</p>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerHeading}>For Job Seekers</h3>
            <p style={styles.footerText}>Explore jobs</p>
            <p style={styles.footerText}>Track applications</p>
            <p style={styles.footerText}>Build your career</p>
          </div>
          <div style={styles.footerColumn}>
            <h3 style={styles.footerHeading}>For Employers</h3>
            <p style={styles.footerText}>Post job openings</p>
            <p style={styles.footerText}>Manage applications</p>
            <p style={styles.footerText}>Find great talent</p>
          </div>
        </div>
        <div className="hireorbit-footer-bottom" style={styles.footerBottom}>
          <span>© {new Date().getFullYear()} JobventrA. All Rights Reserved — KD</span>
          <span>Made for the next generation of talent.</span>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  footer: {
    background: "#0b1228",
    color: "#e2e8f0",
    padding: "38px 8% 18px",
    marginTop: "32px",
    borderTop: "1px solid rgba(103, 232, 249, 0.22)",
  },
  footerContent: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "32px",
    maxWidth: "1200px",
    margin: "0 auto",
    paddingBottom: "28px",
  },
  footerBrand: { minWidth: 0 },
  footerLogo: {
    margin: "0 0 10px",
    fontSize: "27px",
    fontWeight: 900,
    letterSpacing: "-0.7px",
    background: "linear-gradient(90deg, #67e8f9 0%, #a5b4fc 48%, #f0abfc 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "#67e8f9",
  },
  footerHeading: { margin: "4px 0 14px", fontSize: "15px", color: "#ffffff" },
  footerText: { margin: "8px 0", color: "#cbd5e1", fontSize: "14px", lineHeight: 1.6 },
  footerMuted: { margin: "8px 0", color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 },
  footerColumn: { minWidth: 0 },
  footerBottom: {
    borderTop: "1px solid rgba(148, 163, 184, 0.22)",
    paddingTop: "16px",
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    color: "#94a3b8",
    fontSize: "12px",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  page: {
    minHeight: "100vh",
    background: "#f4f7fb",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    background: "#172554",
    color: "white",
    padding: "22px 8%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  logo: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 900,
    letterSpacing: "-1px",
    background: "linear-gradient(90deg, #67e8f9 0%, #a5b4fc 48%, #f0abfc 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "#67e8f9",
    textShadow: "0 0 22px rgba(103, 232, 249, 0.14)",
  },
  tagline: { marginBottom: 0, color: "#dbeafe" },
  headerRight: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
  },
  navButton: {
    padding: "9px 12px",
    background: "transparent",
    color: "white",
    border: "1px solid #93c5fd",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  activeNavButton: {
    padding: "9px 12px",
    background: "#dbeafe",
    color: "#172554",
    border: "1px solid #dbeafe",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  main: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 20px",
  },
  subtitle: {
    color: "#64748b",
    marginBottom: "24px",
    lineHeight: 1.6,
  },
  authCard: {
    maxWidth: "440px",
    margin: "30px auto",
    padding: "28px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    boxShadow: "0 8px 28px rgba(0,0,0,0.05)",
  },
  field: { marginBottom: "18px" },
  dashboardPanel: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "22px",
    marginBottom: "28px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  jobForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "8px 18px",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    background: "white",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
    resize: "vertical",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "15px",
    background: "white",
    color: "#172033",
  },
  filterBox: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "16px",
    alignItems: "end",
    background: "white",
    padding: "22px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    marginBottom: "28px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
  },
  filterField: { minWidth: 0 },
  clearButton: {
    width: "100%",
    padding: "12px",
    background: "#e2e8f0",
    color: "#172033",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "16px",
  },
  resultCount: {
    color: "#475569",
    fontSize: "14px",
  },
  emptyState: {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
    marginBottom: "20px",
  },
  primaryButton: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  logoutButton: {
    padding: "9px 14px",
    background: "white",
    color: "#172554",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  switchText: {
    marginTop: "22px",
    textAlign: "center",
    color: "#475569",
  },
  linkButton: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
  },
  success: {
    padding: "12px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    overflowWrap: "anywhere",
  },
  error: {
    padding: "12px",
    background: "#fee2e2",
    color: "#b91c1c",
    borderRadius: "8px",
    overflowWrap: "anywhere",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    padding: "22px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    overflowWrap: "anywhere",
  },
  description: { color: "#475569", lineHeight: 1.6 },
  skills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "16px",
  },
  skill: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "13px",
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
    paddingTop: "14px",
    borderTop: "1px solid #e2e8f0",
  },
  statusBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "bold",
  },
};

export default App;
