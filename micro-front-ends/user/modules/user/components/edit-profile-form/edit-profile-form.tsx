import { useEditProfile, useReadSessionUser } from '@/user/hooks';
import { EditProfilePayload } from '@/user/types';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, FormInstance, Input, Space, Spin } from 'antd';
import { useRouter } from 'next/router';
import { ReactElement, useRef } from 'react';

const { Item } = Form;
const { Password } = Input;

const TypedForm = Form<EditProfilePayload>;

export const EditProfileForm = (): ReactElement => {
  const formRef = useRef<FormInstance<EditProfilePayload>>(null);

  const { back } = useRouter();

  const { data, loading } = useReadSessionUser();

  const { editProfile, errorMessage, isLoading } = useEditProfile();

  const finishHandler = (editProfilePayload: EditProfilePayload): void => {
    editProfile(editProfilePayload);
  };

  const resetHandler = (): void => {
    if (formRef.current) {
      formRef.current.resetFields();
    }
  };

  return (
    <Spin spinning={isLoading} size='large' indicator={<LoadingOutlined spin />}>
      <Card title='Edit Profile' loading={loading} headStyle={{ textAlign: 'center' }} style={{ maxWidth: '600px', width: '50vw', marginLeft: 'auto', marginRight: 'auto' }}>
        <TypedForm ref={formRef} labelCol={{ span: 8 }} initialValues={data} onFinish={finishHandler}>
          <Item label='First Name' name='newFirstName'>
            <Input />
          </Item>
          <Item label='Last Name' name='newLastName'>
            <Input />
          </Item>
          <Item label='E-mail' name='newEmail' rules={[
            { type: 'email', message: 'Invalid format' }
          ]}>
            <Input />
          </Item>
          <Item label='Password' name='newPassword'>
            <Password />
          </Item>
          <Item wrapperCol={{ offset: 8 }}>
            <Space wrap>
              <Button type='primary' htmlType='submit'>
                Submit
              </Button>
              <Button htmlType='button' onClick={resetHandler}>
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
