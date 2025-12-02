import { DeleteJobForm } from "@/components/forms/DeleteJobForm";
import React from "react";

type Params = Promise<{ jobId: string }>;

const DeleteJobPage = async ({ params }: { params: Params }) => {
  const { jobId } = await params;
  return <DeleteJobForm jobId={jobId} />;
};

export default DeleteJobPage;
