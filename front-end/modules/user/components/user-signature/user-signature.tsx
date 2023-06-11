import { AntdCardMeta } from '@/common/components/antd-card-meta/antd-card-meta';
import { UserSignatureProps } from '@/user/types/user-signature-props';
import { ReactElement } from 'react';

export const UserSignature = (props: UserSignatureProps): ReactElement => {
  const { userId } = props;

  return (
    <AntdCardMeta title='Created By' description={userId} />
  );
};

// import { Card, Skeleton, Typography } from 'antd';
// import { useReadUserById } from '@/user/hooks';
// const { Meta } = Card;
// const { Text } = Typography;

// const { label = 'Test Label', userId = 'Test User ID' } = props;

// const { data, loading } = useReadUserById(userId);

// let title = 'Error';
// let description = 'Failed to load user data.';
// if (data) {
//   const { firstName, lastName } = data;

//   title = label;
//   description = `${firstName} ${lastName}`;
// }
// return (
//   <Skeleton loading={loading} active>
//     <Meta
//       title={title}
//       description={
//         <Text italic>
//           {description}
//         </Text>
//       }
//     />
//   </Skeleton>
// );