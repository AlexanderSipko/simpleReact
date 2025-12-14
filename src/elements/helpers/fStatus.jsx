// my-react-app/src/elements/helpers/fStatus.jsx
import { Tag, Space, Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';


const statusConfig = {
    'active': { color: 'green', label: 'Активен' },
    'inactive': { color: 'red', label: 'Неактивен' },
    'draft': { color: 'orange', label: 'Черновик' },
    'archived': { color: 'gray', label: 'Архив' },
    'rejected': { color:'green', label: 'Отклонено'},
    'published': { color: 'blue', label: 'Опубликован' },
    'pending': { color: 'gold', label: 'На модерации' }
  };


const renderStatus = (status) => {
  
  const config = statusConfig[status] || { 
    color: 'default', 
    label: status || '—' 
  };
  
  return (
    <span style={{ 
      color: config.color,
      fontWeight: 500,
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      backgroundColor: `${config.color}10`
    }}>
      {config.label}
    </span>
  );
};


export const optionsStatus = (options) => {

    const filters = options.forFilters ? [
        // { text: 'Все', value: null },
        ...options.forFilters.map(filter => {
          return {text: statusConfig[filter.value]?.label || '???', value:filter.value}
        })] : undefined

    return {
        render: renderStatus,
        onFilter: (value, record) => {
            if (!value) return true;
            return record.status === value;
        },
        filters: filters,
        filterSearch: true,
        filterMode: 'tree',
        filterMultiple: true,
        ...options
    }
}
