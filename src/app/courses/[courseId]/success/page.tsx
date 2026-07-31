const page = ({
  params,
  searchParams,
}: {
  params: { couresId: string };
  searchParams: { session_id: string };
}) => {
  const { couresId } = params;
  const { session_id } = searchParams;

  return <div>page</div>;
};

export default page;
