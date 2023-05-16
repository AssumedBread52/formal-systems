import { useReadSystemByUrlPath, useUpdateSystem } from '@/system/hooks';
import { UpdateSystemPayload } from '@/system/types';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, FormInstance, Input, Space, Spin } from 'antd';
import { useRouter } from 'next/router';
import { ChangeEvent, ReactElement, useRef, useState } from 'react';

const { Item } = Form;
const { TextArea } = Input;

const TypedForm = Form<UpdateSystemPayload>;

export const UpdateSystemForm = (): ReactElement => {
  const [title, setTitle] = useState<string>('');

  const formRef = useRef<FormInstance<UpdateSystemPayload>>(null);

  const { back, query } = useRouter();

  const urlPath = query['system-url-path']?.toString() ?? '';

  const { data, loading } = useReadSystemByUrlPath(urlPath, !urlPath);

  const { updateSystem, errorMessage, isLoading } = useUpdateSystem();

  const changeHandler = (event: ChangeEvent<HTMLInputElement>): void => {
    event.preventDefault();
    event.stopPropagation();

    setTitle(event.currentTarget.value);
  };

  const finishHandler = (updateSystemPayload: UpdateSystemPayload): void => {
    updateSystemPayload.id = data?.id ?? '';

    updateSystem(updateSystemPayload);
  };

  const resetHandler = (): void => {
    if (formRef.current) {
      formRef.current.resetFields();
    }
  };

  return (
    <Spin spinning={isLoading} size='large' indicator={<LoadingOutlined spin />}>
      <Card title={`Edit Formal System: ${data?.title}`} loading={loading} headStyle={{ textAlign: 'center' }} style={{ maxWidth: '600px', width: '50vw', marginLeft: 'auto', marginRight: 'auto' }}>
        <TypedForm ref={formRef} labelCol={{ span: 8 }} initialValues={data} onFinish={finishHandler}>
          <Item label='Title' name='title' rules={[
            { required: true, message: 'Please enter a title or click reset.' }
          ]}>
            <Input onChange={changeHandler} />
          </Item>
          <Item label='URL Path' name='urlPath'>
            <Input disabled value={encodeURIComponent(title ? title : data?.title ?? '')} />
          </Item>
          <Item label='Description' name='description' rules={[
            { required: true, message: 'Please enter a description or click reset.' }
          ]}>
            <TextArea />
          </Item>
          <Item wrapperCol={{ offset: 8 }}>
            <Space wrap>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
              <Button htmlType='reset' onClick={resetHandler}>
                Reset
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
