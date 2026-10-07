import AdminPressClient from "./AdminPressClient";
import { getAllPressMentionsAdmin } from "@/app/actions/pressActions";

export default async function AdminPressPage() {
  const { data, dbError } = await getAllPressMentionsAdmin();
  return <AdminPressClient initialItems={data} dbError={dbError} />;
}
