
import { Button } from 'antd';
import { TableData } from './elements/table';
import useGetPostsList from './api/index'

const App = () => {

  const [posts, load, error ] = useGetPostsList();

  return <div className="App">
            <Button type="primary">
              Hello Ant Design Button
            </Button>

            <p className='text-center font-bold text-green-600'>Version + 1</p>

            <TableData
              posts={posts}
              load={load}
              error={error}
            >
            </TableData>
          </div>
};

export default App;

