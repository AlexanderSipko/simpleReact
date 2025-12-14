//my-react-app/src/elements/table/index.jsx

import { Table } from "antd";
import { useTableState, useTableParams } from "../hooks/useTableParams";


function TableData({ posts, load, error }) {
  const { tableState, handleTableChange } = useTableState(10);
  const tableParams = useTableParams(posts, load, tableState, handleTableChange, 'id');

  

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'red' 
      }}>
        Ошибка: {error.message || error}
      </div>
    );
  }

  return <Table {...tableParams} />;
}

export { TableData };
