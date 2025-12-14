//my-react-app/src/elements/factories/columnFactory.jsx

import { Space, Button } from 'antd';
import { optionsStatus } from '../helpers/fStatus'
import { optionsDateSimple } from '../helpers/fDateSimple'
import { optionsDateTree } from '../helpers/fDateTree'; // Импортируем древовидный фильтр

import dayjs from 'dayjs';


export const createColumn = (type, options = {}, data=[]) => {
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
        data: data // Важно передать данные!
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

