package com.blindfintech.common.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Set;

@Repository
@RequiredArgsConstructor
public class RedisRepository {
    private final RedisTemplate<String, Object> redisTemplate;

    //데이터 저장
    public void save(String key,Object data){
        redisTemplate.opsForValue().set(key,data);
    }

    //데이터 저장(일정 시간동안)
    public void save(String key,Object data,long ttl){
        redisTemplate.opsForValue().set(key,data, Duration.ofMinutes(ttl));
    }

    //데이터 조회
    public Object get(String key){
        return redisTemplate.opsForValue().get(key);
    }

    //데이터 삭제
    public void delete(String key){
        redisTemplate.delete(key);
    }
    //특정 키값 조회
    public Set<String> getKeys(String pattern){
        return redisTemplate.keys(pattern);
    }

}
