import { useMemo, useState, useCallback } from 'react';
import { useTableConfig } from './useTableConfig';

// ==============================
// КОНФИГУРАЦИИ ТАБЛИЦЫ
// ==============================

// Конфиг пагинации
const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: ['5', '10', '20', '50'],
  showSizeChanger: true,
  showQuickJumper: true,
  showLessItems: true,
  responsive: true,
  placement: ['bottomEnd'],
  showTotal: (total, range) => `${range[0]}-${range[1]} из ${total}`
};

// Конфиг внешнего вида таблицы
const TABLE_STYLE_CONFIG = {
  bordered: true,
  size: 'small',
  scroll: { x: 'max-content' },
  showHeader: true,
  sticky: true,
  rowClassName: (record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
};

// Конфиг локализации
const LOCALE_CONFIG = {
  filterConfirm: 'OK',
  filterReset: 'Сбросить',
  emptyText: 'Нет данных'
};

// Конфиг сортировки
const SORTER_CONFIG = {
  sortDirections: ['ascend', 'descend'],
  showSorterTooltip: true
};

// ==============================
// ХУК ДЛЯ УПРАВЛЕНИЯ СОСТОЯНИЕМ ТАБЛИЦЫ
// ==============================

export const useTableState = (initialPageSize = PAGINATION_CONFIG.defaultPageSize) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: initialPageSize,
    total: 0
  });

  const [filters, setFilters] = useState({});
  const [sorter, setSorter] = useState({});

  const handleTableChange = useCallback((newPagination, newFilters, newSorter) => {
    console.log('Table changed:', { newPagination, newFilters, newSorter });
    
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
    
    setFilters(newFilters);
    setSorter(newSorter);
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: initialPageSize,
      total: 0
    });
  }, [initialPageSize]);

  const setTotal = useCallback((total) => {
    setPagination(prev => ({
      ...prev,
      total
    }));
  }, []);

  const resetAll = useCallback(() => {
    setPagination({
      current: 1,
      pageSize: initialPageSize,
      total: 0
    });
    setFilters({});
    setSorter({});
  }, [initialPageSize]);

  return {
    tableState: {
      pagination,
      filters,
      sorter
    },
    handleTableChange,
    resetPagination,
    setTotal,
    resetAll
  };
};

// ==============================
// УТИЛИТЫ ДЛЯ СОЗДАНИЯ КОНФИГА ТАБЛИЦЫ
// ==============================

// Генерация конфига пагинации
const createPaginationConfig = (data, tableState = {}, handleTableChange) => ({
  current: tableState.pagination?.current || 1,
  pageSize: tableState.pagination?.pageSize || PAGINATION_CONFIG.defaultPageSize,
  total: data?.length || 0, // Теперь total берется из длины данных
  ...PAGINATION_CONFIG,
  onChange: (page, pageSize) => {
    console.log('Page changed:', page, pageSize);
    if (handleTableChange) {
      handleTableChange({ current: page, pageSize }, tableState.filters || {}, tableState.sorter || {});
    }
  },
  onShowSizeChange: (current, size) => {
    console.log('Page size changed:', current, size);
    if (handleTableChange) {
      handleTableChange({ current: 1, pageSize: size }, tableState.filters || {}, tableState.sorter || {});
    }
  }
});

// Генерация базового конфига таблицы
const createBaseTableConfig = (data, tableState = {}, handleTableChange, rowKey) => ({
  rowKey: (record) => record[rowKey],
  loading: false,
  pagination: createPaginationConfig(data, tableState, handleTableChange),
  locale: {
    ...LOCALE_CONFIG,
    emptyText: 'Нет данных'
  },
  ...TABLE_STYLE_CONFIG,
  ...SORTER_CONFIG,
  onChange: handleTableChange || (() => {}),
  onRow: (record, rowIndex) => ({
    onClick: () => console.log('Row clicked:', record, rowIndex),
    onDoubleClick: () => console.log('Row double clicked:', record),
    style: { cursor: 'pointer' }
  })
});

// ==============================
// ОСНОВНОЙ ХУК ДЛЯ ПАРАМЕТРОВ ТАБЛИЦЫ
// ==============================

export const useTableParams = (posts = [], isLoading = false, tableState = {}, handleTableChange, rowKey) => {
  const { columns, dataSource } = useTableConfig(posts, tableState.filters, tableState.sorter);
  
  const tableParams = useMemo(() => {
    const baseConfig = createBaseTableConfig(
      dataSource, // ПЕРЕДАЕМ ОТФИЛЬТРОВАННЫЕ ДАННЫЕ
      tableState, 
      handleTableChange, 
      rowKey
    );
    
    return {
      ...baseConfig,
      columns,
      dataSource: dataSource || [],
      loading: isLoading,
      locale: {
        ...baseConfig.locale,
        emptyText: isLoading ? 'Загрузка...' : LOCALE_CONFIG.emptyText
      },
      // Сохраняем текущие фильтры в состоянии таблицы
      filteredValue: tableState.filters,
      // Сохраняем текущую сортировку
      sortOrder: tableState.sorter?.order,
      sortField: tableState.sorter?.field
    };
  }, [columns, dataSource, isLoading, tableState, handleTableChange, rowKey]);

  return tableParams;
};
// ==============================
// ДОПОЛНИТЕЛЬНЫЕ УТИЛИТЫ
// ==============================

// Получение только базовых стилей таблицы (без состояния)
export const getBaseTableStyles = () => ({
  ...TABLE_STYLE_CONFIG,
  ...SORTER_CONFIG,
  locale: LOCALE_CONFIG
});

// Получение только конфига пагинации
export const getPaginationConfig = (total = 0) => ({
  ...PAGINATION_CONFIG,
  total,
  defaultPageSize: PAGINATION_CONFIG.defaultPageSize
});

// Создание кастомного конфига таблицы
export const createCustomTableConfig = (customConfig = {}) => ({
  ...createBaseTableConfig([], {}, () => {}),
  ...customConfig,
  pagination: {
    ...createPaginationConfig([], {}, () => {}),
    ...customConfig.pagination
  },
  locale: {
    ...LOCALE_CONFIG,
    ...customConfig.locale
  }
});