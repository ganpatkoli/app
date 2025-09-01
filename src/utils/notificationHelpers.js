import { Alert } from 'react-native';

export function notifySuccess(msg) {
  Alert.alert('Success', msg);
}

export function notifyError(msg) {
  Alert.alert('Error', msg);
}

export function notifyWarning(msg) {
  Alert.alert('Warning', msg);
}