// my-react-app/src/elements/helpers/tableHelpers.jsx

// Получение уникальных значений для фильтра
export const getUniqueFilters = (data, field) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  
  const uniqueValues = [...new Set(
    data.map(item => item[field]).filter(value => value != null)
  )];
  
  return uniqueValues.map(value => ({
    text: String(value),
    value: value
  }));
};


// Функция для применения фильтров к данным
export const applyFiltersToDataSource = (data, filters, columns) => {
  if (!data || !filters || Object.keys(filters).length === 0) {
    return data;
  }

  return data.filter(item => {
    // Проверяем каждый фильтр
    return Object.entries(filters).every(([field, filterValues]) => {
      // Если фильтр не установлен или пустой - пропускаем
      if (!filterValues || filterValues.length === 0) {
        return true;
      }

      const value = item[field];
      
      // Находим колонку с этим полем
      const column = columns.find(col => col.dataIndex === field);
      
      // Если есть функция фильтрации в колонке - используем её
      if (column && column.onFilter) {
        return filterValues.some(filterValue => 
          column.onFilter(filterValue, item)
        );
      }
      
      // Стандартная фильтрация
      return filterValues.includes(value);
    });
  });
};
