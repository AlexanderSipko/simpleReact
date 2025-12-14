// my-react-app/src/elements/helpers/fDateTree.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Tree, Button, Space, Input, DatePicker } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// Хук для хранения состояния фильтра между рендерами
const useFilterState = () => {
  const filterStateRef = useRef({
    selectedKeys: [],
    dateRange: null,
    useRangePicker: false
  });

  return filterStateRef;
};

// Генерируем дерево дат из данных
const generateDateTree = (data, dateField = 'createdAt') => {
  if (!data || data.length === 0) return [];
  
  const treeMap = {};
  
  data.forEach(item => {
    const dateStr = item[dateField];
    if (!dateStr) return;
    
    const date = dayjs(dateStr);
    const year = date.year();
    const month = date.month() + 1;
    const day = date.date();
    const dateKey = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    // Уровень года
    if (!treeMap[year]) {
      treeMap[year] = {
        key: `year-${year}`,
        title: `${year} год`,
        children: {},
        count: 0,
        checkable: true,
        selectable: false
      };
    }
    treeMap[year].count++;
    
    // Уровень месяца
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    if (!treeMap[year].children[monthKey]) {
      const monthName = date.format('MMMM');
      treeMap[year].children[monthKey] = {
        key: `month-${monthKey}`,
        title: `${monthName}`,
        children: {},
        count: 0,
        checkable: true,
        selectable: false
      };
    }
    treeMap[year].children[monthKey].count++;
    
    // Уровень дня
    if (!treeMap[year].children[monthKey].children[dateKey]) {
      treeMap[year].children[monthKey].children[dateKey] = {
        key: `date-${dateKey}`,
        title: `${day} ${date.format('MMMM')}`,
        dateStr: dateStr,
        count: 0,
        isLeaf: true,
        checkable: true,
        selectable: false
      };
    }
    treeMap[year].children[monthKey].children[dateKey].count++;
  });
  
  // Преобразуем в формат для Tree
  const treeData = Object.values(treeMap).map(yearNode => ({
    ...yearNode,
    children: Object.values(yearNode.children).map(monthNode => ({
      ...monthNode,
      children: Object.values(monthNode.children)
    }))
  }));
  
  // Сортируем по убыванию года
  treeData.sort((a, b) => {
    const yearA = parseInt(a.key.split('-')[1]);
    const yearB = parseInt(b.key.split('-')[1]);
    return yearB - yearA;
  });
  
  return treeData;
};

// Получаем все листовые ключи из выбранных
const getAllLeafKeys = (checkedKeys, treeData) => {
  const leafKeys = new Set();
  
  const findAndCollectLeaves = (key) => {
    const findNode = (nodes) => {
      for (const node of nodes) {
        if (node.key === key) {
          if (node.isLeaf) {
            leafKeys.add(node.key);
          } else if (node.children) {
            // Собираем все листья из поддерева
            const collectLeaves = (childNodes) => {
              childNodes.forEach(child => {
                if (child.isLeaf) {
                  leafKeys.add(child.key);
                } else if (child.children) {
                  collectLeaves(child.children);
                }
              });
            };
            collectLeaves(node.children);
          }
          return true;
        }
        if (node.children && findNode(node.children)) {
          return true;
        }
      }
      return false;
    };
    findNode(treeData);
  };
  
  checkedKeys.forEach(findAndCollectLeaves);
  return Array.from(leafKeys);
};

// Основной компонент фильтра
const DateTreeFilter = ({ 
  data, 
  dateField, 
  setSelectedKeys, 
  selectedKeys, 
  confirm, 
  clearFilters 
}) => {
  const [treeData, setTreeData] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [useRangePicker, setUseRangePicker] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const filterState = useFilterState();

  // Инициализация
  useEffect(() => {
    const tree = generateDateTree(data, dateField);
    setTreeData(tree);
    
    if (tree.length > 0) {
      setExpandedKeys([tree[0].key]);
    }
  }, [data, dateField]);

  // Восстановление состояния
  useEffect(() => {
    if (selectedKeys && selectedKeys.length > 0) {
      if (selectedKeys[0] === 'clear') {
        setCheckedKeys([]);
        setDateRange(null);
      } else if (selectedKeys[0]?.startsWith('range:')) {
        const rangeStr = selectedKeys[0].replace('range:', '');
        try {
          const [start, end] = rangeStr.split('|');
          setDateRange([dayjs(start), dayjs(end)]);
          setUseRangePicker(true);
        } catch (e) {
          console.error('Error parsing range:', e);
        }
      } else {
        setCheckedKeys(selectedKeys);
      }
    }
  }, [selectedKeys]);

  // Обновляем состояние фильтра
  useEffect(() => {
    filterState.current = {
      selectedKeys: checkedKeys,
      dateRange,
      useRangePicker
    };
  }, [checkedKeys, dateRange, useRangePicker]);

  const handleCheck = (checked) => {
    setCheckedKeys(checked);
  };

  const handleConfirm = () => {
    if (useRangePicker && dateRange) {
      // Сохраняем диапазон как строку
      const rangeValue = `range:${dateRange[0].toISOString()}|${dateRange[1].toISOString()}`;
      setSelectedKeys([rangeValue]);
    } else {
      // Сохраняем выбранные ключи
      setSelectedKeys(checkedKeys);
    }
    confirm();
  };

  const handleClear = () => {
    setCheckedKeys([]);
    setDateRange(null);
    setSelectedKeys(['clear']);
    clearFilters();
    confirm();
  };

  const handleSelectAll = () => {
    const allLeafKeys = treeData.flatMap(year => 
      year.children.flatMap(month => 
        month.children.map(day => day.key)
      )
    );
    setCheckedKeys(allLeafKeys);
  };

  return (
    <div style={{ padding: 8, minWidth: 320 }}>
      <div style={{ marginBottom: 12 }}>
        <Input
          placeholder="Поиск по датам..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ marginBottom: 8 }}
        />
        
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Button
            size="small"
            type={!useRangePicker ? "primary" : "default"}
            onClick={() => setUseRangePicker(false)}
          >
            Дерево дат
          </Button>
          <Button
            size="small"
            type={useRangePicker ? "primary" : "default"}
            onClick={() => setUseRangePicker(true)}
            icon={<CalendarOutlined />}
          >
            Диапазон
          </Button>
        </div>
      </div>

      {useRangePicker ? (
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          format="DD.MM.YYYY"
          style={{ width: '100%', marginBottom: 12 }}
        />
      ) : (
        <div style={{ 
          maxHeight: 300, 
          overflow: 'auto', 
          border: '1px solid #d9d9d9', 
          borderRadius: 4,
          padding: 8
        }}>
          <Tree
            checkable
            checkedKeys={checkedKeys}
            onCheck={handleCheck}
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            treeData={treeData}
            checkStrictly={false}
            showLine
            selectable={false}
            titleRender={(node) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span>{node.title}</span>
                <span style={{ color: '#888', fontSize: '12px' }}>
                  ({node.count})
                </span>
              </div>
            )}
          />
        </div>
      )}

      <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        <Button size="small" onClick={handleClear}>
          Сбросить
        </Button>
        <div style={{ display: 'flex', gap: 8 }}>
          {!useRangePicker && (
            <Button size="small" onClick={handleSelectAll}>
              Все
            </Button>
          )}
          <Button type="primary" size="small" onClick={handleConfirm}>
            Применить
          </Button>
        </div>
      </Space>
      
      <div style={{ 
        marginTop: 12, 
        padding: 8, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 4,
        fontSize: '12px'
      }}>
        <div><strong>Выбрано:</strong></div>
        {useRangePicker && dateRange ? (
          <div>
            {dateRange[0].format('DD.MM.YYYY')} - {dateRange[1].format('DD.MM.YYYY')}
          </div>
        ) : (
          <div>
            {checkedKeys.length > 0 
              ? `${getAllLeafKeys(checkedKeys, treeData).length} дат(ы)` 
              : 'Не выбрано'}
          </div>
        )}
      </div>
    </div>
  );
};

// Главная функция фильтрации - используется глобальная переменная
let globalFilterState = {
  selectedKeys: [],
  dateRange: null,
  useRangePicker: false
};

// Функция для обновления глобального состояния
export const updateDateFilterState = (state) => {
  globalFilterState = { ...globalFilterState, ...state };
};

// Функция фильтрации
const onDateTreeFilter = (value, record, dataIndex) => {
  console.log('Filter called with:', { value, recordDate: record[dataIndex] });
  
  const recordDate = record[dataIndex];
  if (!recordDate) return false;
  
  try {
    const recordDay = dayjs(recordDate).startOf('day');
    
    // Проверяем значение из selectedKeys
    if (value && value.length > 0) {
      const firstValue = value[0];
      
      if (firstValue === 'clear') {
        return true;
      }
      
      if (firstValue?.startsWith('range:')) {
        // Диапазон дат
        const rangeStr = firstValue.replace('range:', '');
        const [startStr, endStr] = rangeStr.split('|');
        const startDate = dayjs(startStr).startOf('day');
        const endDate = dayjs(endStr).startOf('day');
        
        const isInRange = recordDay.isSameOrAfter(startDate) && 
                         recordDay.isSameOrBefore(endDate);
        console.log('Range filter result:', { isInRange, startDate: startDate.format(), endDate: endDate.format(), recordDay: recordDay.format() });
        return isInRange;
      } else {
        // Древовидный выбор - проверяем каждый ключ
        return value.some(key => {
          if (key.startsWith('date-')) {
            const dateKey = key.replace('date-', '');
            const selectedDay = dayjs(dateKey).startOf('day');
            const isMatch = recordDay.isSame(selectedDay, 'day');
            console.log('Date match check:', { dateKey, selectedDay: selectedDay.format(), recordDay: recordDay.format(), isMatch });
            return isMatch;
          }
          return false;
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Filter error:', error);
    return true;
  }
};

// Альтернативная функция фильтрации - всегда использует последнее состояние
const createDateFilterFunction = (dataIndex) => {
  let lastFilterState = null;
  
  return (value, record) => {
    const recordDate = record[dataIndex];
    if (!recordDate) return false;
    
    try {
      const recordDay = dayjs(recordDate).startOf('day');
      
      // Если есть value (из selectedKeys), используем его
      if (value && value.length > 0) {
        lastFilterState = value;
      }
      
      // Если нет сохраненного состояния - показываем все
      if (!lastFilterState || lastFilterState.length === 0) {
        return true;
      }
      
      const firstValue = lastFilterState[0];
      
      if (firstValue === 'clear') {
        return true;
      }
      
      if (firstValue?.startsWith('range:')) {
        const rangeStr = firstValue.replace('range:', '');
        const [startStr, endStr] = rangeStr.split('|');
        const startDate = dayjs(startStr).startOf('day');
        const endDate = dayjs(endStr).startOf('day');
        
        return recordDay.isSameOrAfter(startDate) && 
               recordDay.isSameOrBefore(endDate);
      } else {
        return [lastFilterState].some(key => {
          if (key.startsWith('date-')) {
            const dateKey = key.replace('date-', '');
            const selectedDay = dayjs(dateKey).startOf('day');
            return recordDay.isSame(selectedDay, 'day');
          }
          return false;
        });
      }
    } catch (error) {
      console.error('Filter error:', error);
      return true;
    }
  };
};

// Основная функция для создания колонки
export const optionsDateTree = (options = {}) => {
  const {
    dataIndex = 'createdAt',
    title = 'Дата создания',
    format = 'DD.MM.YYYY',
    data = [],
    ...restOptions
  } = options;

  // Создаем уникальную функцию фильтрации для этой колонки
  const filterFunction = createDateFilterFunction(dataIndex);

  const baseConfig = {
    title,
    dataIndex,
    render: (date) => {
      if (!date) return '—';
      return dayjs(date).format(format);
    },
    sorter: (a, b) => {
      const timeA = a[dataIndex] ? new Date(a[dataIndex]).getTime() : 0;
      const timeB = b[dataIndex] ? new Date(b[dataIndex]).getTime() : 0;
      return timeA - timeB;
    },
    filterDropdown: (props) => (
      <DateTreeFilter 
        {...props} 
        data={data}
        dateField={dataIndex}
      />
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    onFilter: filterFunction, // Используем созданную функцию
    width: 120,
    align: 'center',
    ...restOptions
  };

  return baseConfig;
};