import { describe, it, expect, vi } from "vitest";
import { renderWithProviders, screen, fireEvent } from "@/test-utils";
import { CropTypeSelector } from "./CropTypeSelector";

const t = (key: string) => {
  const map: Record<string, string> = {
    "crop.rice": "Rice",
    "crop.corn": "Corn",
    "scan.cropType": "Crop Type",
  };
  return map[key] || key;
};

describe("CropTypeSelector", () => {
  it("renders both crop options", () => {
    renderWithProviders(<CropTypeSelector cropType="rice" onChange={() => {}} t={t} />);
    expect(screen.getByText("Rice")).toBeInTheDocument();
    expect(screen.getByText("Corn")).toBeInTheDocument();
  });

  it("calls onChange when clicking corn", () => {
    const onChange = vi.fn();
    renderWithProviders(<CropTypeSelector cropType="rice" onChange={onChange} t={t} />);
    fireEvent.click(screen.getByText("Corn"));
    expect(onChange).toHaveBeenCalledWith("corn");
  });

  it("calls onChange when clicking rice", () => {
    const onChange = vi.fn();
    renderWithProviders(<CropTypeSelector cropType="corn" onChange={onChange} t={t} />);
    fireEvent.click(screen.getByText("Rice"));
    expect(onChange).toHaveBeenCalledWith("rice");
  });
});
