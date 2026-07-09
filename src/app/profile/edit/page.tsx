import { redirect } from "next/navigation";

// `/profile/edit` is an alias for the canonical self-service editor at `/me`.
export default function ProfileEditRedirect() {
  redirect("/me");
}
