import { useCreateSystem } from '@/system/hooks';
import { NewSystemPayload } from '@/system/types';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Space, Spin } from 'antd';
import { useRouter } from 'next/router';
import { ChangeEvent, ReactElement, useState } from 'react';

const { Item } = Form;
const { TextArea } = Input;

const TypedForm = Form<NewSystemPayload>;

export const CreateSystemForm = (): ReactElement => {
  const [title, setTitle] = useState<string>('');

  const { back } = useRouter();

  const { createSystem, errorMessage, isLoading } = useCreateSystem();

  const changeHandler = (event: ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setTitle(event.currentTarget.value);
  };

  const finishHandler = (newSystemPayload: NewSystemPayload): void => {
    createSystem(newSystemPayload);
  };

  return (
    <Spin spinning={isLoading} size='large' indicator={<LoadingOutlined spin />}>
      <Card title='Create Formal System' headStyle={{ textAlign: 'center' }} style={{ maxWidth: '600px', width: '50vw', marginLeft: 'auto', marginRight: 'auto' }}>
        <TypedForm labelCol={{ span: 8 }} onFinish={finishHandler}>
          <Item label='Title' name='title' rules={[
            { required: true, message: 'Please enter a title.' }
          ]}>
            <Input onChange={changeHandler} />
          </Item>
          <Item label='URL Path'>
            <Input disabled value={encodeURIComponent(title)} />
          </Item>
          <Item label='Description' name='description' rules={[
            { required: true, message: 'Please enter a description.' }
          ]}>
            <TextArea />
          </Item>
          <Item wrapperCol={{ offset: 8 }}>
            <Space wrap>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
              <Button htmlType='button' onClick={back}>
                Cancel
              </Button>
            </Space>
          </Item>
        </TypedForm>
        {errorMessage && (
          <Alert message='Error' description={errorMessage} type='error' showIcon closable />
        )}
      </Card>
    </Spin>
  );
};
