"""
Service rekomendasi penanganan penyakit tanaman menggunakan Google Gemini.
Hanya file ini yang boleh memanggil Gemini API.
"""

import logging

import google.generativeai as genai

from app.core.config import settings

logger = logging.getLogger(__name__)

# Nama penyakit yang ramah dibaca — untuk dimasukkan ke prompt
# Key disease names HARUS sinkron dengan CLASS_NAMES_RICE / CLASS_NAMES_CORN
# di ml-service/app/config.py (source of truth untuk key disease)
DISEASE_DISPLAY_NAMES: dict[str, str] = {
    "rice_leaf_blast": "Blast Padi (Magnaporthe oryzae)",
    "rice_bacterial_leaf_blight": "Hawar Daun Bakteri (Xanthomonas oryzae)",
    "rice_brown_spot": "Bercak Cokelat Padi (Bipolaris oryzae)",
    "rice_hispa": "Hispa Padi (Dicladispa armigera)",
    "rice_healthy": "Padi Sehat",
    "corn_northern_leaf_blight": "Hawar Daun Utara Jagung (Exserohilum turcicum)",
    "corn_common_rust": "Karat Jagung (Puccinia sorghi)",
    "corn_gray_leaf_spot": "Bercak Daun Abu-abu Jagung (Cercospora zeae-maydis)",
    "corn_healthy": "Jagung Sehat",
}

CROP_DISPLAY_NAMES = {
    "rice": "padi",
    "corn": "jagung",
}

_PROMPT_TEMPLATE = """\
Kamu adalah asisten ahli pertanian Indonesia yang membantu petani menangani penyakit tanaman.

Tanaman yang terdeteksi sakit: **{crop_name}**
Penyakit yang terdeteksi: **{disease_name}**
Tingkat keyakinan diagnosis: **{confidence_pct}%**

Berikan rekomendasi penanganan dalam format berikut (gunakan Bahasa Indonesia yang mudah dipahami petani awam):

## Tentang Penyakit Ini
[Jelaskan penyakit ini dalam 2–3 kalimat: apa penyebabnya, bagaimana menyebar, dan seberapa berbahaya jika tidak ditangani]

## Gejala yang Perlu Diperhatikan
[3–5 gejala spesifik dalam format bullet point]

## Langkah Penanganan
[5–7 langkah konkret yang bisa dilakukan petani, urutkan dari yang paling mendesak]

## Produk yang Direkomendasikan
[2–3 nama produk fungisida/pestisida/bakterisida yang umum tersedia di Indonesia, sertakan bahan aktif dan dosis aplikasi]

## Pencegahan untuk Musim Berikutnya
[3–4 langkah pencegahan praktis]

## Estimasi Biaya Penanganan
[Perkiraan biaya per hektar dalam Rupiah, berikan rentang harga]

Penting: Jawab dalam Bahasa Indonesia. Gunakan kalimat pendek dan langsung. Hindari istilah teknis yang tidak perlu.\
"""


def _get_client() -> genai.GenerativeModel:
    """Inisialisasi Gemini client (lazy, singleton per proses)."""
    genai.configure(api_key=settings.gemini_api_key)
    return genai.GenerativeModel(settings.gemini_model)


async def get_recommendation(
    disease: str,
    crop_type: str,
    confidence: float,
) -> str:
    """
    Generate rekomendasi penanganan penyakit menggunakan Gemini.

    Jika disease adalah 'healthy' atau API key belum dikonfigurasi,
    kembalikan pesan default tanpa memanggil API.
    """
    # Jika tanaman sehat, tidak perlu rekomendasi
    if "healthy" in disease:
        crop = CROP_DISPLAY_NAMES.get(crop_type, crop_type)
        return (
            f"## Tanaman Sehat ✅\n\n"
            f"Tanaman {crop} Anda tidak menunjukkan tanda-tanda penyakit yang terdeteksi.\n\n"
            f"**Tips perawatan rutin:**\n"
            f"- Pertahankan jarak tanam yang cukup untuk sirkulasi udara\n"
            f"- Pantau kondisi daun secara berkala (seminggu sekali)\n"
            f"- Jaga kebersihan lahan dari gulma dan sisa tanaman sakit\n"
            f"- Pastikan drainase lahan baik untuk mencegah kelembapan berlebih"
        )

    # Jika API key belum diisi, kembalikan placeholder
    if not settings.gemini_api_key:
        logger.warning("GEMINI_API_KEY belum dikonfigurasi — rekomendasi tidak tersedia")
        disease_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
        return (
            f"## Rekomendasi Belum Tersedia\n\n"
            f"Penyakit **{disease_name}** terdeteksi pada tanaman Anda.\n\n"
            f"Rekomendasi penanganan belum tersedia saat ini. "
            f"Hubungi penyuluh pertanian setempat untuk penanganan lebih lanjut."
        )

    disease_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
    crop_name = CROP_DISPLAY_NAMES.get(crop_type, crop_type)
    confidence_pct = round(confidence * 100, 1)

    prompt = _PROMPT_TEMPLATE.format(
        crop_name=crop_name,
        disease_name=disease_name,
        confidence_pct=confidence_pct,
    )

    try:
        model = _get_client()
        import asyncio
        response = await asyncio.wait_for(
            asyncio.to_thread(model.generate_content, prompt),
            timeout=30.0,
        )
        recommendation = response.text
        logger.info(f"Rekomendasi Gemini berhasil untuk penyakit: {disease}")
        return recommendation

    except asyncio.TimeoutError:
        logger.error(f"Gemini API timeout untuk penyakit: {disease}")
        disease_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
        return (
            f"## {disease_name}\n\n"
            f"Layanan rekomendasi sedang sibuk. Silakan coba lagi nanti."
        )
    except Exception as exc:
        logger.error(f"Gemini API error untuk penyakit {disease}: {exc}")
        # Fallback ringan — jangan gagalkan seluruh scan hanya karena rekomendasi gagal
        disease_name = DISEASE_DISPLAY_NAMES.get(disease, disease)
        return (
            f"## {disease_name}\n\n"
            f"Penyakit ini terdeteksi pada tanaman Anda dengan keyakinan {confidence_pct}%.\n\n"
            f"Rekomendasi penanganan saat ini tidak tersedia. "
            f"Silakan konsultasikan dengan penyuluh pertanian setempat."
        )
