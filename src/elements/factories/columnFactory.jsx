import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Space, Button, Input } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { optionsStatus } from '../helpers/fStatus';
import { optionsDateTree } from '../helpers/fDateTree';
import dayjs from 'dayjs';

// Компонент с подсветкой текста
const HighlightedText = ({ text, searchTerm }) => {
  if (!searchTerm || !text) return <>{text || '—'}</>;
  
  // Экранируем специальные символы для регулярного выражения
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  try {
    const parts = text.split(new RegExp(`(${escapedSearchTerm})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <mark 
              key={i} 
              style={{ 
                backgroundColor: '#4b4834ff', 
                color: 'white',
                padding: '0 6px',
                borderRadius: '6px'
              }}
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  } catch (error) {
    console.error('Highlight error:', error);
    return <>*{text}</>;
  }
};

// Компонент выпадающего поиска
const ContentSearchDropdown = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
  const [searchValue, setSearchValue] = useState(selectedKeys[0] || '');
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSearch = () => {
    setSelectedKeys(searchValue ? [searchValue] : []);
    confirm();
  };

  const handleClear = () => {
    setSearchValue('');
    setSelectedKeys([]);
    if (clearFilters) {
      clearFilters();
    }
    confirm();
  };

  // Всегда рендерим CloseOutlined, но скрываем когда нет текста
  const suffix = (
    <CloseOutlined
      onClick={() => {
        setSearchValue('');
        if (selectedKeys.length > 0) {
          setSelectedKeys([]);
        }
      }}
      style={{ 
        cursor: 'pointer', 
        fontSize: '12px',
        opacity: searchValue ? 1 : 0,
        pointerEvents: searchValue ? 'auto' : 'none',
        transition: 'opacity 0.2s'
      }}
    />
  );

  return (
    <div style={{ padding: 8, minWidth: 200 }}>
      <Input
        ref={inputRef}
        placeholder="Поиск по содержанию..."
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
        }}
        onPressEnter={handleSearch}
        suffix={suffix}
        style={{ marginBottom: 8 }}
      />
      <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          size="small"
          onClick={handleClear}
          disabled={!searchValue && selectedKeys.length === 0}
        >
          Сбросить
        </Button>
        <Button
          type="primary"
          size="small"
          onClick={handleSearch}
          icon={<SearchOutlined />}
        >
          Поиск
        </Button>
      </Space>
    </div>
  );
};

// Основной компонент для отображения контента
const ContentDisplay = ({ text, searchTerm = '' }) => {
  return (
    <div 
      className="max-w-[500px] whitespace-pre-wrap break-words"
      style={{ 
        maxHeight: '100px',
        overflowY: 'auto',
        overflowX: 'hidden',
        wordBreak: 'break-word',
        lineHeight: '1.4',
        paddingRight: '8px',
        scrollbarWidth: 'thin'
      }}
    >
      {searchTerm ? (
        <HighlightedText text={text} searchTerm={searchTerm} />
      ) : (
        text || '—'
      )}
    </div>
  );
};

export const createColumn = (type, options = {}, data = [], tableFilters = {}) => {
  // Получаем поисковый термин из фильтров
  const getSearchTermForContent = () => {
    if (tableFilters && tableFilters.content && tableFilters.content.length > 0) {
      return tableFilters.content[0];
    }
    return '';
  };

  const baseColumns = {
    id: {
      title: 'ID',
      dataIndex: 'id',
      sorter: (a, b) => a.id - b.id,
      width: 80,
      ...options
    },
    title: {
      title: 'Заголовок',
      dataIndex: 'title',
      ellipsis: true,
      ...options
    },
    content: {
      title: 'Содержание',
      dataIndex: 'content',
      ellipsis: false,
      width: 420,
      filterDropdown: (props) => (
        <ContentSearchDropdown {...props} />
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => {
        if (!value) return true;
        if (!record.content) return false;
        
        return record.content
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      },
      render: (text) => {
        const searchTerm = getSearchTermForContent();
        console.log('searchTerm', searchTerm);
        return <ContentDisplay text={text} searchTerm={searchTerm} />;
      },
      ...options
    },
    status: {
      title: 'Статус',
      dataIndex: 'status',
      ...optionsStatus(options),
    },
    createdAt: {
      title: 'Дата',
      dataIndex: 'createdAt',
      ...optionsDateTree({
        dataIndex: 'createdAt',
        title: 'Дата создания',
        format: 'DD.MM.YYYY HH:mm',
        data: data
      }),
    },
    actions: {
      title: 'Действия',
      key: 'actions',
      render: () => (
        <Space>
          <Button size="small">Редактировать</Button>
          <Button size="small" danger>Удалить</Button>
        </Space>
      ),
      width: 200,
      ...options
    }
  };

  return baseColumns[type] || { title: type, dataIndex: type, ...options };
};