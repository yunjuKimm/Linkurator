import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LeftSidebar from "./components/left-sidebar"
import PostList from "./components/post-list"
import RightSidebar from "./components/right-sidebar"
import FollowingCurations from "./curation/following/page"

export default function Home() {
  return (
    <main className="container grid grid-cols-12 gap-6 px-4 py-6">
      <div className="col-span-2">
        <LeftSidebar />
      </div>
      <div className="col-span-7">
        <Tabs defaultValue="latest" className="w-full">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="latest" className="flex-1">
              최신
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              팔로잉
            </TabsTrigger>
          </TabsList>
          <TabsContent value="latest">
            <PostList />
          </TabsContent>
          <TabsContent value="following">
            <FollowingCurations />
          </TabsContent>
        </Tabs>
      </div>
      <div className="col-span-3">
        <RightSidebar />
      </div>
    </main>
  )
}

