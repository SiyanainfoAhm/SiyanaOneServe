import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import AttachmentDropzone, { type UploadFile } from "./AttachmentDropzone";

function Harness() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  return <AttachmentDropzone files={files} onChange={setFiles} />;
}

describe("AttachmentDropzone", () => {
  it("accepts a zip file as ready to upload", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input.accept).toContain(".zip");
    expect(screen.getByText(/ZIP/)).toBeInTheDocument();

    const zip = new File(["PK"], "handover.zip", { type: "application/zip" });
    await user.upload(input, zip);

    expect(screen.getByText("handover.zip")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
  });
});
