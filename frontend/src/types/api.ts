// Central API type definitions — synced with backend schemas
// Source of truth: backend/app/schemas

export type UserResponse = {
  id: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  province: string | null;
  city: string | null;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserResponse;
};

export type ScanResult = {
  detected_disease: string;
  confidence: number;
  alternatives: Array<{
    disease: string;
    confidence: number;
  }> | null;
  recommendation: string | null;
  model_version: string;
  is_mock: boolean;
  processed_at: string | null;
};

export type ScanResponse = {
  id: string;
  crop_type: "rice" | "corn";
  status: "pending" | "processing" | "completed" | "failed";
  image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  result: ScanResult | null;
};

export type DashboardStats = {
  total_scans: number;
  completed_scans: number;
  disease_detected: number;
  healthy_detected: number;
  by_crop: Array<{
    crop_type: string;
    count: number;
    disease_count: number;
  }>;
  top_diseases: Array<{
    disease: string;
    count: number;
  }>;
  timeline: Array<{
    month: string;
    count: number;
    disease_count: number;
  }>;
};

export type AdminStats = {
  total_scans: number;
  total_users: number;
  disease_detected: number;
  healthy_detected: number;
  active_alerts: number;
  by_province: Array<{
    province: string;
    total_scans: number;
    disease_count: number;
    top_disease: string | null;
  }>;
  top_diseases: Array<{
    disease: string;
    count: number;
  }>;
  timeline: Array<{
    month: string;
    count: number;
    disease_count: number;
  }>;
};

export type CommunityAuthor = {
  id: string;
  full_name: string;
};

export type CommunityPost = {
  id: string;
  title: string;
  body: string;
  category: string;
  crop_type: "rice" | "corn" | null;
  comment_count: number;
  like_count: number;
  is_pinned: boolean;
  is_liked: boolean;
  created_at: string;
  author: CommunityAuthor;
};

export type PostComment = {
  id: string;
  body: string;
  created_at: string;
  author: CommunityAuthor;
};

export type PostDetail = {
  id: string;
  title: string;
  body: string;
  category: string;
  crop_type: "rice" | "corn" | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  is_pinned: boolean;
  is_liked: boolean;
  author: CommunityAuthor;
  comments: PostComment[];
};

export type FieldResponse = {
  id: string;
  name: string;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  area_hectares: number | null;
  crop_type: "rice" | "corn" | null;
  created_at: string;
};

export type HeatmapPoint = {
  scan_id: string;
  lat: number;
  lng: number;
  disease: string;
  crop_type: "rice" | "corn";
  confidence: number;
  month: string;
};

export type HeatmapResponse = {
  points: HeatmapPoint[];
  total: number;
};

export type AlertResponse = {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  province: string | null;
  city: string | null;
  disease: string | null;
  is_read: boolean;
  created_at: string;
};
