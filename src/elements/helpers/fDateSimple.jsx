// my-react-app/src/elements/helpers/fDate.jsx
import { DatePicker, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Расширяем dayjs плагинами
if (typeof dayjs !== 'undefined') {
  dayjs.extend(isSameOrAfter);
  dayjs.extend(isSameOrBefore);
}

const { RangePicker } = DatePicker;

// Рендер даты
const renderDate = (isoString, format = 'DD.MM.YYYY') => {
  if (!isoString) return '—';
  try {
    return dayjs(isoString).format(format);
  } catch {
    return isoString || '—';
  }
};

// ВРЕМЕННОЕ ХРАНИЛИЩЕ для фильтров (потому что onFilter не получает массив)
let currentFilterRange = null;

// Кастомный компонент фильтра
const RangeFilterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters, dataIndex }) => {
  const handleRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      // Сохраняем в глобальную переменную
      currentFilterRange = {
        start: dates[0].startOf('day').toISOString(),
        end: dates[1].endOf('day').toISOString()
      };
      // Для Ant Design все равно нужно что-то передать
      setSelectedKeys([dates[0].toISOString()]);
    } else {
      currentFilterRange = null;
      setSelectedKeys([]);
    }
  };

  const handleConfirm = () => {
    console.log('Filter applied:', currentFilterRange);
    confirm();
  };

  const handleClear = () => {
    currentFilterRange = null;
    clearFilters();
    confirm();
  };

  return (
    <div style={{ padding: 8, minWidth: 250 }}>
      <RangePicker
        format="DD.MM.YYYY"
        onChange={handleRangeChange}
        style={{ width: '100%', marginBottom: 8 }}
        placeholder={['Начальная дата', 'Конечная дата']}
        allowClear
      />
      
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          type="link"
          size="small"
          onClick={handleClear}
        >
          Сбросить
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleConfirm}
        >
          Применить
        </Button>
      </Space>
    </div>
  );
};

// Функция фильтрации
const onDateRangeFilter = (value, record, dataIndex) => {
  // value здесь будет ТОЛЬКО ПЕРВЫЙ элемент массива из setSelectedKeys
  // Поэтому используем глобальную переменную
  
  if (!currentFilterRange) {
    console.log('No filter range');
    return true;
  }
  
  const { start, end } = currentFilterRange;
  const recordDate = record[dataIndex];
  
  if (!recordDate) return false;
  
  try {
    const recordDay = dayjs(recordDate).startOf('day');
    const startDay = dayjs(start).startOf('day');
    const endDay = dayjs(end).startOf('day');
    
    const isInRange = recordDay.isSameOrAfter(startDay) && 
                     recordDay.isSameOrBefore(endDay);
    
    console.log('Filter check:', {
      recordDate: recordDate,
      recordDay: recordDay.format('DD.MM.YYYY'),
      start: startDay.format('DD.MM.YYYY'),
      end: endDay.format('DD.MM.YYYY'),
      isInRange
    });
    
    return isInRange;
  } catch (error) {
    console.error('Filter error:', error);
    return true;
  }
};

// Альтернативный подход: использовать filteredValue
const createDateColumnWithFilter = (options = {}) => {
  const {
    dataIndex = 'createdAt',
    title = 'Дата создания',
    format = 'DD.MM.YYYY',
    ...restOptions
  } = options;

  // Локальное состояние для компонента
  const [filterRange, setFilterRange] = React.useState(null);
  
  const filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    const handleRangeChange = (dates) => {
      if (dates && dates.length === 2) {
        setFilterRange({
          start: dates[0].startOf('day').toISOString(),
          end: dates[1].endOf('day').toISOString()
        });
        setSelectedKeys(['filter_active']); // Просто флаг
      } else {
        setFilterRange(null);
        setSelectedKeys([]);
      }
    };

    return (
      <div style={{ padding: 8 }}>
        <RangePicker
          format="DD.MM.YYYY"
          onChange={handleRangeChange}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <Space>
          <Button size="small" onClick={() => {
            setFilterRange(null);
            clearFilters();
            confirm();
          }}>
            Сбросить
          </Button>
          <Button type="primary" size="small" onClick={() => confirm()}>
            OK
          </Button>
        </Space>
      </div>
    );
  };

  return {
    title,
    dataIndex,
    render: (date) => renderDate(date, format),
    sorter: (a, b) => {
      const timeA = a[dataIndex] ? new Date(a[dataIndex]).getTime() : 0;
      const timeB = b[dataIndex] ? new Date(b[dataIndex]).getTime() : 0;
      return timeA - timeB;
    },
    filterDropdown,
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      if (!filterRange) return true;
      
      const recordDate = dayjs(record[dataIndex]).startOf('day');
      const startDate = dayjs(filterRange.start).startOf('day');
      const endDate = dayjs(filterRange.end).startOf('day');
      
      return recordDate.isSameOrAfter(startDate) && 
             recordDate.isSameOrBefore(endDate);
    },
    width: 100,
    align: 'center',
    ...restOptions
  };
};

// ЛУЧШИЙ ВАРИАНТ: используем filteredValue и управляем состоянием в родительском компоненте
export const optionsDate = (options = {}) => {
  const {
    dataIndex = 'createdAt',
    title = 'Дата создания',
    format = 'DD.MM.YYYY',
    filteredValue, // Получаем из родительского компонента
    onFilterChange, // Callback для изменения фильтра
    ...restOptions
  } = options;

  const filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    const [localRange, setLocalRange] = React.useState(null);

    const handleRangeChange = (dates) => {
      if (dates && dates.length === 2) {
        const range = {
          start: dates[0].startOf('day').toISOString(),
          end: dates[1].endOf('day').toISOString()
        };
        setLocalRange(range);
        setSelectedKeys([JSON.stringify(range)]); // Сохраняем как строку
      } else {
        setLocalRange(null);
        setSelectedKeys([]);
      }
    };

    const handleConfirm = () => {
      if (onFilterChange && localRange) {
        onFilterChange(localRange);
      }
      confirm();
    };

    const handleClear = () => {
      setLocalRange(null);
      if (onFilterChange) {
        onFilterChange(null);
      }
      clearFilters();
      confirm();
    };

    // Восстанавливаем значение при открытии
    React.useEffect(() => {
      if (filteredValue) {
        try {
          const range = typeof filteredValue === 'string' 
            ? JSON.parse(filteredValue[0]) 
            : filteredValue;
          setLocalRange(range);
          setSelectedKeys([JSON.stringify(range)]);
        } catch (e) {
          console.error('Error parsing filter value:', e);
        }
      }
    }, []);

    return (
      <div style={{ padding: 8 }}>
        <RangePicker
          format="DD.MM.YYYY"
          onChange={handleRangeChange}
          value={
            localRange
              ? [dayjs(localRange.start), dayjs(localRange.end)]
              : null
          }
          style={{ width: '100%', marginBottom: 8 }}
        />
        <Space>
          <Button size="small" onClick={handleClear}>
            Сбросить
          </Button>
          <Button type="primary" size="small" onClick={handleConfirm}>
            OK
          </Button>
        </Space>
      </div>
    );
  };

  return {
    title,
    dataIndex,
    render: (date) => renderDate(date, format),
    sorter: (a, b) => {
      const timeA = a[dataIndex] ? new Date(a[dataIndex]).getTime() : 0;
      const timeB = b[dataIndex] ? new Date(b[dataIndex]).getTime() : 0;
      return timeA - timeB;
    },
    filterDropdown,
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    filteredValue, // Управляется извне
    onFilter: (value, record) => {
      // Здесь value будет строкой JSON
      if (!value || !value[0]) return true;
      
      try {
        const range = JSON.parse(value[0]);
        const recordDate = dayjs(record[dataIndex]).startOf('day');
        const startDate = dayjs(range.start).startOf('day');
        const endDate = dayjs(range.end).startOf('day');
        
        return recordDate.isSameOrAfter(startDate) && 
               recordDate.isSameOrBefore(endDate);
      } catch {
        return true;
      }
    },
    width: 100,
    align: 'center',
    ...restOptions
  };
};

// ПРОСТОЙ РАБОЧИЙ ВАРИАНТ: используем timestamp для сравнения
export const optionsDateSimple = (options = {}) => {
  const {
    dataIndex = 'createdAt',
    title = 'Дата создания',
    format = 'DD.MM.YYYY',
    ...restOptions
  } = options;

  // Локальное состояние в замыкании
  let currentFilter = null;

  const filterDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    const handleRangeChange = (dates) => {
      if (dates && dates.length === 2) {
        // Сохраняем timestamp начала и конца дня
        const startTimestamp = dates[0].startOf('day').valueOf();
        const endTimestamp = dates[1].endOf('day').valueOf();
        
        currentFilter = { startTimestamp, endTimestamp };
        // Передаем любой флаг, главное не пустой массив
        setSelectedKeys(['date_filter_active']);
      } else {
        currentFilter = null;
        setSelectedKeys([]);
      }
    };

    const handleConfirm = () => {
      confirm();
    };

    return (
      <div style={{ padding: 8 }}>
        <RangePicker
          format="DD.MM.YYYY"
          onChange={handleRangeChange}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <Space>
          <Button size="small" onClick={() => {
            currentFilter = null;
            clearFilters();
            confirm();
          }}>
            Сбросить
          </Button>
          <Button type="primary" size="small" onClick={handleConfirm}>
            OK
          </Button>
        </Space>
      </div>
    );
  };

  return {
    title,
    dataIndex,
    render: (date) => renderDate(date, format),
    sorter: (a, b) => {
      const timeA = a[dataIndex] ? new Date(a[dataIndex]).getTime() : 0;
      const timeB = b[dataIndex] ? new Date(b[dataIndex]).getTime() : 0;
      return timeA - timeB;
    },
    filterDropdown,
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      if (!currentFilter) return true;
      
      const recordTimestamp = new Date(record[dataIndex]).getTime();
      const { startTimestamp, endTimestamp } = currentFilter;
      
      return recordTimestamp >= startTimestamp && 
             recordTimestamp <= endTimestamp;
    },
    width: 100,
    align: 'center',
    ...restOptions
  };
};