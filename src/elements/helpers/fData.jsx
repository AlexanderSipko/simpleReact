// my-react-app/src/elements/helpers/fStatus.jsx
import { Tag, Space, Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
// import { dayjs }


export const optionsData = (options) => {

    const filters = options.forFilters ? [
        ...options.forFilters.map(filter => {
          return {text: filter.toTimeString(), value:filter}
        })] : undefined

    // console.log(filters)

    return {
        onFilter: (value, record) => {
            return record.createdAt === value;
        },
        filters: filters,
        filterSearch: true,
        filterMode: 'tree',
        filterMultiple: true,
        ...options
    }
}
