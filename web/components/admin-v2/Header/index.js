import OperationHeader from '../../admin/OperationHeader.js';

export default function Header(props) {
  return <OperationHeader {...props} searchAction="/admin-v2" />;
}
