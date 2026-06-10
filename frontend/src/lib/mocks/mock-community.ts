import type { CommunityPost, PostDetail } from "@/types/api";

const mockAuthors = {
  andi: { id: "u-mock-andi", full_name: "Andi Prasetyo" },
  sari: { id: "u-mock-sari", full_name: "Sari Wulandari" },
  rudi: { id: "u-mock-rudi", full_name: "Rudi Hidayat" },
  dian: { id: "u-mock-dian", full_name: "Dian Kartika" },
} as const;

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "00000000-0000-0000-0000-000000000101",
    title: "Daun padi bercak cokelat setelah hujan 3 hari, langkah pertama apa?",
    body: "Halo rekan-rekan, di sawah saya (Sleman) mulai muncul bercak cokelat di daun padi umur 42 HST. Kondisi lahan cukup lembap karena hujan terus. Mohon saran langkah awal yang aman sebelum menyebar.",
    category: "question",
    crop_type: "rice",
    comment_count: 3,
    like_count: 11,
    is_pinned: true,
    is_liked: false,
    created_at: "2026-04-27T07:15:00Z",
    author: mockAuthors.andi,
  },
  {
    id: "00000000-0000-0000-0000-000000000102",
    title: "Pengalaman menekan karat jagung dengan sanitasi lahan rutin",
    body: "Musim lalu saya sempat kena karat jagung lumayan parah. Musim ini saya coba sanitasi gulma dan sisa tanaman tiap minggu, plus atur jarak tanam lebih longgar. Hasilnya serangan lebih ringan.",
    category: "experience",
    crop_type: "corn",
    comment_count: 4,
    like_count: 18,
    is_pinned: false,
    is_liked: false,
    created_at: "2026-04-24T10:20:00Z",
    author: mockAuthors.sari,
  },
  {
    id: "00000000-0000-0000-0000-000000000103",
    title: "Checklist cepat sebelum foto daun untuk scan AI",
    body: "Biar hasil scan lebih stabil, saya biasanya bersihkan lensa, ambil foto pagi/siang, dan hindari bayangan tangan menutup daun. Ada tambahan tips dari teman-teman?",
    category: "tips",
    crop_type: null,
    comment_count: 2,
    like_count: 9,
    is_pinned: false,
    is_liked: false,
    created_at: "2026-04-21T03:45:00Z",
    author: mockAuthors.rudi,
  },
];

export const MOCK_COMMUNITY_POST_DETAILS: PostDetail[] = [
  {
    ...MOCK_COMMUNITY_POSTS[0],
    comments: [
      {
        id: "c-mock-101-1",
        body: "Cek dulu kepadatan tanam dan sirkulasi. Kalau terlalu rapat biasanya bercak cepat naik.",
        created_at: "2026-04-27T08:01:00Z",
        author: mockAuthors.sari,
      },
      {
        id: "c-mock-101-2",
        body: "Saya biasa buang daun yang paling parah lalu pantau 2-3 hari sebelum tindakan lanjutan.",
        created_at: "2026-04-27T09:12:00Z",
        author: mockAuthors.dian,
      },
      {
        id: "c-mock-101-3",
        body: "Coba scan dari beberapa titik petakan supaya kelihatan sebarannya, jangan satu daun saja.",
        created_at: "2026-04-27T10:30:00Z",
        author: mockAuthors.rudi,
      },
    ],
  },
  {
    ...MOCK_COMMUNITY_POSTS[1],
    comments: [
      {
        id: "c-mock-102-1",
        body: "Setuju soal sanitasi. Di lahan saya efeknya paling terasa ke penurunan daun terinfeksi.",
        created_at: "2026-04-24T11:05:00Z",
        author: mockAuthors.andi,
      },
      {
        id: "c-mock-102-2",
        body: "Untuk jarak tanam, pakai berapa cm, Bu?",
        created_at: "2026-04-24T11:22:00Z",
        author: mockAuthors.rudi,
      },
      {
        id: "c-mock-102-3",
        body: "Saya pakai 70 x 25 cm waktu itu. Memang populasi turun sedikit tapi penyakit jauh lebih terkendali.",
        created_at: "2026-04-24T11:39:00Z",
        author: mockAuthors.sari,
      },
      {
        id: "c-mock-102-4",
        body: "Terima kasih sharingnya, ini bisa jadi SOP kelompok tani kami.",
        created_at: "2026-04-24T13:00:00Z",
        author: mockAuthors.dian,
      },
    ],
  },
  {
    ...MOCK_COMMUNITY_POSTS[2],
    comments: [
      {
        id: "c-mock-103-1",
        body: "Tambahan: ambil 2 angle (depan dan belakang daun) biar indikasi gejala lebih jelas.",
        created_at: "2026-04-21T04:30:00Z",
        author: mockAuthors.andi,
      },
      {
        id: "c-mock-103-2",
        body: "Jangan upload foto blur, itu paling sering bikin confidence rendah.",
        created_at: "2026-04-21T05:02:00Z",
        author: mockAuthors.sari,
      },
    ],
  },
];

const MOCK_POST_DETAIL_BY_ID = new Map(
  MOCK_COMMUNITY_POST_DETAILS.map((post) => [post.id, post]),
);

export function getMockCommunityPostDetailById(id: string): PostDetail | null {
  return MOCK_POST_DETAIL_BY_ID.get(id) ?? null;
}
