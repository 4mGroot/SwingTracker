import {StyleSheet} from 'react-native';

export const mystyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  container1: {
    justifyContent: 'center',
    alignItems: 'center',
    padding:20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius:10,
    marginBottom:20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  buttonSpacing: {
    marginBottom: 10, // ระยะห่างระหว่างปุ่ม
  },
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius:10,

  },
  count: {
    fontSize: 60,
    marginVertical: 20,
    color: 'blue',
  },
  target: {
    fontSize: 20,
    color: 'red',
    marginVertical: 10,
  },
  statusText: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
  },
});
