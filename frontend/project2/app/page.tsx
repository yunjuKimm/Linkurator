import LeftSidebar from "./components/left-sidebar";
import PostList from "./components/post-list";
import RightSidebar from "./components/right-sidebar";

export default function Home() {
  return (
    <main className="container grid grid-cols-12 gap-6 px-4 py-6">
      <div className="col-span-2">
        <LeftSidebar />
      </div>
      <div className="col-span-7">
        <PostList />
      </div>
      <div className="col-span-3">
        <RightSidebar />
      </div>
    </main>
  );
}
