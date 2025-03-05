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
        <div className="flex items-center justify-between mb-4">
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-500">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium bg-white text-black shadow">
              최신순
            </button>
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium">
              인기순
            </button>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500">필터</span>
            <select className="ml-2 h-8 rounded-md border bg-white px-2 text-sm">
              <option>전체</option>
            </select>
          </div>
        </div>
        <PostList />
      </div>
      <div className="col-span-3">
        <RightSidebar />
      </div>
    </main>
  );
}
