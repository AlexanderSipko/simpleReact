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

