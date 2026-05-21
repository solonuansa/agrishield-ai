import { describe, it, expect, vi, beforeEach } from "vitest";
import { useToastStore } from "./useToast";

describe("useToastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  describe("addToast", () => {
    it("adds toast to the toasts array", () => {
      useToastStore.getState().addToast("success", "Berhasil disimpan");
      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].type).toBe("success");
      expect(toasts[0].message).toBe("Berhasil disimpan");
    });

    it("auto-removes toast after default duration", () => {
      vi.useFakeTimers();
      useToastStore.getState().addToast("info", "Notifikasi");
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(4000);
      expect(useToastStore.getState().toasts).toHaveLength(0);
      vi.useRealTimers();
    });

    it("auto-removes toast after custom duration", () => {
      vi.useFakeTimers();
      useToastStore.getState().addToast("warning", "Peringatan", 2000);
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(1999);
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(1);
      expect(useToastStore.getState().toasts).toHaveLength(0);
      vi.useRealTimers();
    });

    it("does not auto-remove when duration is 0", () => {
      vi.useFakeTimers();
      useToastStore.getState().addToast("info", "Persistent", 0);
      expect(useToastStore.getState().toasts).toHaveLength(1);

      vi.advanceTimersByTime(10000);
      expect(useToastStore.getState().toasts).toHaveLength(1);
      vi.useRealTimers();
    });
  });

  describe("removeToast", () => {
    it("removes specific toast by id", () => {
      useToastStore.getState().addToast("success", "Pesan 1");
      useToastStore.getState().addToast("error", "Pesan 2");
      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(2);

      useToastStore.getState().removeToast(toasts[0].id);
      const remaining = useToastStore.getState().toasts;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].message).toBe("Pesan 2");
    });

    it("does nothing when removing non-existent id", () => {
      useToastStore.getState().addToast("info", "Pesan");
      useToastStore.getState().removeToast("nonexistent");
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
  });

  describe("multiple toasts", () => {
    it("stacks multiple toasts correctly", () => {
      useToastStore.getState().addToast("success", "Pertama");
      useToastStore.getState().addToast("error", "Kedua");
      useToastStore.getState().addToast("warning", "Ketiga");

      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(3);
      expect(toasts[0].message).toBe("Pertama");
      expect(toasts[1].message).toBe("Kedua");
      expect(toasts[2].message).toBe("Ketiga");
    });
  });
});

describe("useToast", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it("provides convenience methods for each toast type via the store", () => {
    const store = useToastStore.getState();
    store.addToast("success", "Sukses");
    store.addToast("error", "Error");
    store.addToast("warning", "Warning");
    store.addToast("info", "Info");

    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(4);
    expect(toasts[0].type).toBe("success");
    expect(toasts[1].type).toBe("error");
    expect(toasts[2].type).toBe("warning");
    expect(toasts[3].type).toBe("info");
  });
});
