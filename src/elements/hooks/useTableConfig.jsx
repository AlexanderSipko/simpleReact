import { useMemo } from 'react';
import { createColumn } from '../factories/columnFactory';
import { 
  getUniqueFilters,
  applyFiltersToDataSource
} from '../helpers/tableHelpers';

export const useTableConfig = (posts = [], tableFilters = {}, tableSorter = {}) => {

  const statusFilters = useMemo(() => 
    getUniqueFilters(posts, 'status'), 
  [posts]);

  const dateFilters = useMemo(() => 
    getUniqueFilters(posts, 'createdAt'), 
  [posts]);

  // ОПРЕДЕЛЯЕМ ПОЛЯ - ПРАВИЛЬНО ПЕРЕДАЕМ ПАРАМЕТРЫ!
  const columns = useMemo(() => [
    createColumn('id', { title: 'ID' }, posts, tableFilters),
    createColumn('title', { width: 100 }, posts, tableFilters),
    createColumn('content', { width: 420 }, posts, tableFilters), // ← width передаем как options
    createColumn('status', { 
      forFilters: statusFilters, 
      width: 50 
    }, posts, tableFilters),
    createColumn('createdAt', { 
      title: 'Дата создания',  
      forFilters: dateFilters 
    }, posts, tableFilters),
    createColumn('actions', {}, posts, tableFilters)
  ], [statusFilters, dateFilters, posts, tableFilters]); // ← добавляем tableFilters в зависимости

  // ПРИМЕНЯЕМ ФИЛЬТРЫ К ДАННЫМ
  const dataSource = useMemo(() => {
    if (!posts || posts.length === 0) return [];
    
    // Применяем фильтры из tableState.filters
    let filteredData = posts;
    
    if (tableFilters && Object.keys(tableFilters).length > 0) {
      filteredData = applyFiltersToDataSource(posts, tableFilters, columns);
    }
    
    // Применяем сортировку из tableState.sorter
    if (tableSorter && tableSorter.field && tableSorter.order) {
      filteredData = [...filteredData].sort((a, b) => {
        const field = tableSorter.field;
        const order = tableSorter.order;
        const valueA = a[field];
        const valueB = b[field];
        
        if (order === 'ascend') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
      });
    }
    
    return filteredData;
  }, [posts, tableFilters, tableSorter, columns]);

  return {
    columns,
    dataSource // возвращаем отфильтрованные данные
  };
};