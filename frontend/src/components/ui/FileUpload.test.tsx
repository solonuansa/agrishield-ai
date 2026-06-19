import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { FileUpload } from "./FileUpload";

function wrap(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

describe("FileUpload", () => {
  it("renders drop zone", () => {
    wrap(<FileUpload onFile={() => {}} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onFile when file is selected via input", () => {
    const onFile = vi.fn();
    const { container } = wrap(<FileUpload onFile={onFile} />);
    const file = new File(["test"], "test.png", { type: "image/png" });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it("shows preview when preview prop is provided", () => {
    wrap(<FileUpload onFile={() => {}} preview="data:image/png;base64,abc" />);
    expect(screen.getByAltText("Preview")).toBeInTheDocument();
  });

  it("does not accept invalid file type", () => {
    const onFile = vi.fn();
    const { container } = wrap(<FileUpload onFile={onFile} />);
    const file = new File(["test"], "test.gif", { type: "image/gif" });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(onFile).not.toHaveBeenCalled();
  });

  it("shows external error when provided", () => {
    wrap(<FileUpload onFile={() => {}} error="Upload failed" />);
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
  });
});
