/**
 * Implementation of Skilling's algorithm in C. Skilling, 2004. Programming the Hilbert curve.
 *
 * Author:    Elouan Le Bars Created:   24.05.2021
 *
 **/

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <limits.h>
#include <math.h>

/*
 * Function: integertostring
 * ----------------------------
 *   Converts an integer `value` to a string using the specified `base`
 *   and stores the result in the array given by `result` parameter.
 *
 *   value:  value to be converted to a string result: array in memory where to store the resulting string base:   numerical base used to represent the value as a string, between 2 and 36
 *
 *   returns: pointer to the resulting string, same as parameter `result`
 */
char *integertostring(uint64_t value, char *result, int base)
{
    // check that the base if valid
    if ((base < 2) || (base > 36)) {
        *result = '\0'; return result;
    }

    char    *ptr = result, *ptr1 = result, tmp_char;
    int     tmp_value;

    do {
        tmp_value   = value;
        value       /= base;
        *ptr++      = "zyxwvutsrqponmlkjihgfedcba9876543210123456789abcdefghijklmnopqrstuvwxyz"[35 + (tmp_value - value * base)];
    } while (value);

    // Apply negative sign
    if (tmp_value < 0) {
        *ptr++ = '-';
    }

    *ptr-- = '\0';

    while (ptr1 < ptr) {
        tmp_char    = *ptr;
        *ptr--      = *ptr1;
        *ptr1++     = tmp_char;
    }

    return result;
}

/*
 * Function: binary_representation
 * ----------------------------
 *   Returns a binary string representation of `num`, zero padded to `width` bits.
 *
 *   num:   the number to convert width: width of the returned binary string
 *
 *   returns: binary string representation of `num`
 */
char *binary_representation(uint64_t num, unsigned long width)
{
    static char buffer[512];    // TODO: use malloc to avoid problem with sizes

    // Convert to binary string
    integertostring(num, buffer, 2);

    // Fill with zeros
    static char padded_binary[512]; // TODO: use malloc, do not use static + reset

    strcpy(padded_binary, "");

    int i;

    if (width > strlen(buffer)) {
        for (i = 0; i < (width - strlen(buffer)); i++) {
            strcat(padded_binary, "0");
        }
    }

    strcat(padded_binary, buffer);
    strcpy(buffer, "");

    return padded_binary;
}

/*
 * Function: hilbert_integer_to_transpose
 * ----------------------------
 *   Stores a hilbert integer `h` as its transpose `x`.
 *
 *   h: hilbert integer
 *   p: the hilbert order, i.e. the number of cuts in each dimension
 *   n: number of parameters
 *
 *   returns: transpose of h (n components with values between 0 and 2^(p-1))
 */
uint8_t *hilbert_integer_to_transpose(uint64_t h, const unsigned long p, const unsigned long n)
{
    uint8_t *transpose  = malloc(n * sizeof(uint8_t));  // TODO: free
    char    *h_bit_str  = binary_representation(h, n * p);

    if (transpose == NULL) {
        printf("malloc failed\n");
    }

    for (size_t i = 0; i < n; i++) {
        char    *buffer = (char *)malloc(p * sizeof(char) + 1);
        size_t  idx     = i;

        for (size_t j = 0; j < p; j++) {
            buffer[j]   = h_bit_str[idx];
            idx         = idx + n;
        }

        buffer[p]       = '\0';
        transpose[i]    = (uint8_t)strtol(buffer, NULL, 2);

        free(buffer);
    }

    return transpose;
}

/*
 * Function: transpose_to_hilbert_integer
 * ----------------------------
 *   Restore a hilbert index `h` from its transpose `x`.
 *
 *   X: transpose of h (n components with values between 0 and 2^(p-1))
 *   p: the hilbert order, i.e. the number of cuts in each dimension
 *   n: number of parameters
 *
 *   returns: index along hilbert curve
 */
uint64_t transpose_to_hilbert_integer(uint8_t * X, const unsigned long p, const unsigned long n)
{
  char** x_bit_str = malloc(n * sizeof(char*));

  for (int i = 0; i < n; i++)
    x_bit_str[i] = malloc((p+1) * sizeof(char));

  for (int i = 0; i < n; i++) {
    strcat(x_bit_str[i], binary_representation(X[i], p));
  }

  char* h_bit_str = malloc(n*p*sizeof(char));

  int index = 0;

  for (int i = 0; i < p; i++) {
    for (int j = 0; j < n; j++) {
      h_bit_str[index] = (char) x_bit_str[j][i];
      index++;
    }
  }

  return (uint64_t)strtoull(h_bit_str, NULL, 2);
}


/*
 * Function: coordinates_from_distance
 * ----------------------------
 *   Returns the n-dimensional coordinates for a given hilbert distance.
 *
 *   h: integer distance along the hilbert curve p: the hilbert order, i.e. the number of cuts in each dimension n: number of parameters
 *
 *   returns: array of coordinates in the n-dimensional space, with values between 0 and 2^(p-1)
 */
uint8_t *coordinates_from_distance(const uint64_t h, const unsigned long p, const unsigned long n)
{
    uint8_t *X = hilbert_integer_to_transpose(h, p, n);
    // printf("INDEX : %llu, N: %lu, P: %lu \n", h, n, p);

    uint64_t max_h = (uint64_t)pow(2, p * n);

    // printf("Max h from C code : %llu \n", max_h);

    if (max_h == 0) {
        printf("C - Error : too much dimensions and iterations for hilbert curve computation. \n");
        return NULL;
    }

    uint64_t N = (uint64_t)2 << ((uint64_t)p - 1), P, Q, t;

    int i;

    // Gray decode by H ^ (H/2)
    t = X[n - 1] >> 1;

    for (i = n - 1; i > 0; i--) {
        X[i] ^= X[i - 1];
    }

    X[0] ^= t;

    // Undo excess work
    for (Q = 2; Q != N; Q <<= 1) {
        P = Q - 1;

        for (i = n - 1; i >= 0; i--) {
            if (X[i] & Q) {
                X[0] ^= P;  // invert
            } else {
                t       = (X[0] ^ X[i]) & P;
                X[0]    ^= t;
                X[i]    ^= t;
            }
        }
    }   // exchange

    return X;
}

/*
 * Function: distance_from_coordinates
 * ----------------------------
 *   Return distance along the hilbert curve for a given point.
 *
 *   X: an n-dimensional vector where each component value is between 0 and 2**p-1.
 *   p: the hilbert order, i.e. the number of cuts in each dimension n: number of parameters
 *
 *   returns: uint64_t distance along hilbert curve
 */
uint64_t distance_from_coordinates(uint8_t *X, const unsigned long p, const unsigned long n)
{
  // TODO: check if the size of the X array is equal to n

    /* Check on variables sizes */
    uint64_t max_x = (uint64_t)(pow(2, p) - 1);

    for (int i = 0; i < n; i++) {
      if (X[i] > max_x) {
          printf("C - Error : coordinates must be inferior to 2^p, with p the granularity of the computation. \n");
          return NULL;
      }
    }

    uint64_t M = (uint64_t)1 << ((uint64_t)p - 1), P, Q, t;

    int i;

    // Inverse undo
    for (Q = M; Q > 1; Q >>= 1) {
        P = Q - 1;

        for (i = 0; i < n; i++) {
            if (X[i] & Q) {
                X[0] ^= P;  // invert
            } else {
                t       = (X[0] ^ X[i]) & P;
                X[0]    ^= t;
                X[i]    ^= t;
            }
        }
    }   // exchange

    // Gray encode
    for (i = 1; i < n; i++) {
        X[i] ^= X[i - 1];
    }

    t = 0;

    for (Q = M; Q > 1; Q >>= 1) {
        if (X[n - 1] & Q) {
            t ^= Q - 1;
        }
    }

    for (i = 0; i < n; i++) {
        X[i] ^= t;
    }

    // Print point
    // printf("\n X after bits operations = ");

    // for (int i = 0; i < n; i++) {
    //     printf("%u, ", X[i]);
    // }

    return transpose_to_hilbert_integer(X, p, n);
}

// /* Only for testing purposes */
// void main()
// {
//     /* TESTS (Index -> Coordinates) */
//     uint64_t index;
//
//     printf("Enter an index (0 to exit) : \n");
//     scanf("%llu", &index);
//
//     uint8_t* coordinates = coordinates_from_distance(index, 4, 6);
//
//     printf("\n X = ");
//     for (int i = 0; i < sizeof(coordinates) / sizeof(*coordinates); i++) {
//       printf("%u, ", coordinates[i]);
//     }
//
//     /* TESTS (Coordinates -> Index) */
//     uint8_t coordinates[4] = {6,3,4,8};
//
//     // distance_from_coordinates(coordinates, 7, 3);
//     printf("distance from coordinates : %llu", distance_from_coordinates(coordinates, 2, 4));
//
// }
