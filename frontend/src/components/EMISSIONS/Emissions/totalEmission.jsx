import Row1 from "./details/row1";
import Row2 from "./details/row2";
import Row3 from "./details/row3";

const monthlySeries = [
  {date: "2023-12", value: 54},
  {date: "2024-1", value: 70},
  {date: "2024-2", value: 60},
  {date: "2024-3", value: 48},
  {date: "2024-4", value: 57},
  {date: "2024-5", value: 65},
  {date: "2024-6", value: 72},
  {date: "2024-7", value: 75},
  {date: "2024-8", value: 54},
  {date: "2024-9", value: 45},
  {date: "2024-10", value: 43},
  {date: "2024-11", value: 41},
  {date: "2024-12", value: 45},
]
function EmissionsPage() {
  return (
    <>
      <Row1 scope1Emission={4560} scope2Emission={37820} />
      <Row2 />
      <Row3 series={monthlySeries} unitLabel="배출량 [만]" />
    </>
  );
}

export default EmissionsPage;