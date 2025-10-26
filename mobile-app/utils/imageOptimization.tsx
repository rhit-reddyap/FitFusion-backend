import React from 'react';
import { Image, ImageProps, StyleSheet } from 'react-native';

interface OptimizedImageProps extends ImageProps {
  source: any;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'contain',
  ...props
}) => {
  return (
    <Image
      source={source}
      style={[styles.default, style]}
      resizeMode={resizeMode}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  default: {
    // Default styles for optimized images
  },
});