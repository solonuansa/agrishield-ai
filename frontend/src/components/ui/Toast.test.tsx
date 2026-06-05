import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ToastContainer } from "./Toast";
import { useToastStore } from "@/lib/hooks/useToast";

describe("ToastContainer", () => {
  it("renders container without toasts (empty state)", () => {
    useToastStore.setState({ toasts: [] });
    const { container } = render(<ToastContainer />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelector(".fixed")).toBeInTheDocument();
  });
});

describe("useToastStore", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it("starts with empty toasts array", () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it("addToast adds a toast", () => {
    useToastStore.getState().addToast("success", "Data tersimpan");
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe("success");
    expect(toasts[0].message).toBe("Data tersimpan");
  });

  it("addToast generates unique id", () => {
    useToastStore.getState().addToast("info", "Pesan 1");
    useToastStore.getState().addToast("info", "Pesan 2");
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(2);
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it("removeToast removes a toast by id", () => {
    useToastStore.getState().addToast("error", "Gagal");
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it("removeToast does nothing for unknown id", () => {
    useToastStore.getState().addToast("info", "Pesan");
    useToastStore.getState().removeToast("unknown-id");
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });
});
