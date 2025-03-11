interface PlaylistDetailPageProps {
  params: { id: string };
}

export default function PlaylistDetailPage({
  params,
}: PlaylistDetailPageProps) {
  const { id } = params;

  return (
    <div>
      <h1>플레이리스트 상세 페이지</h1>
      <p>ID: {id}</p>
      {/* 상세 내용 렌더링 */}
    </div>
  );
}
